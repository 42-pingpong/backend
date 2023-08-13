import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { EntityManager, Join, Not, Repository } from 'typeorm';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { User } from 'src/entities/user/user.entity';
import { AddAdminDto } from './dto/add-admin.dto';
import { DeleteAdminDto } from './dto/delete-admin.dto';
import { JoinGroupChatDto } from './dto/join-group-chat.dto';
import { BanDto } from './dto/ban.dto';
import { GroupChatMessageDto } from './request/groupChatMessage.dto';
import { MessageInfo } from 'src/entities/chat/messageInfo.entity';
import { GroupChatMessage } from 'src/entities/chat/groupChatMessage.entity';
import { MuteRequestDto } from './request/mute.dto';
import { DirectMessageDto } from './request/DirectMessage.dto';
import { DirectMessage } from 'src/entities/chat/directMessage.entity';
import { GetDirectMessageDto } from './request/getDirectMessage.dto';
import { GetGroupMessageDto } from './request/getGroupMessage.dto';
import { BlockRequestDto } from './request/block.request.dto';
import { UnBlockRequestDto } from './request/unBlock.request.dto';
import { BlockUserList } from 'src/entities/user/blockUserList.entity';
import { DirectMessageResponse } from './response/directMessage.response';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(GroupChat)
    private readonly groupChatRepository: Repository<GroupChat>,

    @InjectRepository(BlockUserList)
    private readonly blockUserListRepository: Repository<BlockUserList>,
  ) {}

  async getGroupChatList() {
    return await this.groupChatRepository.find({
      select: {
        groupChatId: true,
        chatName: true,
        levelOfPublicity: true,
        maxParticipants: true,
        curParticipants: true,
        owner: {
          id: true,
          nickName: true,
        },
      },
    });
  }

  async createGroupChat(createChatDto: CreateGroupChatDto) {
    // 그룹 채팅방을 생성하고 저장하는 로직
    return await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        if (createChatDto.participants != undefined) {
          createChatDto['curParticipants'] =
            1 + createChatDto.participants.length;
        }
        const result = await manager.insert(GroupChat, createChatDto);

        if (createChatDto.participants != undefined) {
          await manager
            .createQueryBuilder(GroupChat, 'groupChat')
            .relation('joinedUser')
            .of(result.identifiers[0].groupChatId)
            .add(createChatDto.participants);
        }

        return await manager.findOne(GroupChat, {
          where: { groupChatId: result.identifiers[0].groupChatId },
          relations: {
            joinedUser: true,
            owner: true,
          },
          select: {
            groupChatId: true,
            chatName: true,
            levelOfPublicity: true,
            maxParticipants: true,
            curParticipants: true,
            ownerId: true,
            owner: {
              id: true,
              nickName: true,
            },
            joinedUser: {
              id: true,
              nickName: true,
            },
          },
        });
      },
    );
  }

  async getGroupChat(groupChatId: number) {
    return await this.groupChatRepository.findOne({
      where: { groupChatId: groupChatId },
      select: [
        'chatName',
        'levelOfPublicity',
        'maxParticipants',
        'curParticipants',
      ],
    });
  }

  async getJoinedUserList(groupChatId: number) {
    return await this.groupChatRepository.findOne({
      where: { groupChatId: groupChatId },
      relations: ['joinedUser'],
      select: ['joinedUser'],
    });
  }

  async updateGroupChat(
    updateGroupChatDto: UpdateGroupChatDto,
    groupChatId: number,
  ) {
    // 그룹 채팅방의 정보를 수정하는 로직
    /**
     * 요청한 유저가 admin/owner인지 확인하는 로직이 필요합니다.
     */
    await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        // 그룹 채팅방의 현재 참여 인원 조회
        const curGroupChat = await manager.findOne(GroupChat, {
          where: { groupChatId },
          select: ['curParticipants'],
        });

        if (
          curGroupChat.curParticipants >= updateGroupChatDto.maxParticipants
        ) {
          throw new ForbiddenException();
        }

        await manager.update(GroupChat, groupChatId, updateGroupChatDto);
      },
    );
  }

  async joinGroupChat(groupChatId: number, dto: JoinGroupChatDto) {
    // 그룹 채팅방에 참여하는 로직
    return await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        // 그룹 채팅방의 현재 참여 인원 조회
        const groupChat: GroupChat = await manager
          .getRepository(GroupChat)
          .findOne({
            where: { groupChatId },
            relations: {
              admin: true,
              joinedUser: true,
              bannedUser: true,
            },
          });
        if (!groupChat) {
          throw new NotFoundException('그룹 채팅방이 존재하지 않습니다.');
        }

        if (groupChat.levelOfPublicity === 'Prot') {
          if (dto.password && groupChat.password !== dto.password) {
            throw new ForbiddenException('비밀번호가 일치하지 않습니다.');
          }
        }

        const isOwner = groupChat.ownerId === dto.userId;
        if (isOwner) {
          return;
        }

        // 그룹 채팅방에 참여한 유저가 admin인지 검증
        const isAdmin = groupChat.admin.find(
          (admin) => admin.id === dto.userId,
        );
        if (isAdmin) {
          return;
        }

        // 그룹 채팅방에 참여한 유저가 bannedUser인지 검증
        const isBanned = groupChat.bannedUser.find(
          (bannedUser) => bannedUser.id === dto.userId,
        );
        if (isBanned) {
          throw new ForbiddenException('참여할 수 없는 그룹 채팅방입니다.');
        }

        // 그룹 채팅방의 최대 참여 인원 조회
        if (groupChat.curParticipants >= groupChat.maxParticipants) {
          throw new ForbiddenException();
        }

        const user = await manager.getRepository(User).findOne({
          where: { id: dto.userId },
        });
        if (!user) {
          throw new NotFoundException('user가 존재하지 않습니다.');
        }

        // 그룹 채팅방에 참여한 유저 추가
        // save보다 update가 더 빠르다.
        await manager
          .getRepository(GroupChat)
          .createQueryBuilder()
          .relation(GroupChat, 'joinedUser')
          .of(groupChat)
          .add(user);

        await manager
          .getRepository(GroupChat)
          .createQueryBuilder()
          .update()
          .set({ curParticipants: groupChat.curParticipants + 1 })
          .execute();
      },
    );
  }

  async addAdmin(groupChatId: number, dto: AddAdminDto) {
    await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        const groupChat: GroupChat = await manager
          .getRepository(GroupChat)
          .findOne({
            where: {
              groupChatId: groupChatId,
            },
            relations: {
              admin: true,
              joinedUser: true,
            },
          });

        if (!groupChat) {
          throw new NotFoundException();
        }

        // admin에 이미 requestedId가 있는지 검증
        const isalreadyAdmin = groupChat.admin.find(
          (admin) => admin.id === dto.requestedId,
        );
        if (isalreadyAdmin) {
          throw new ConflictException('이미 admin 권한이 있습니다.');
        }

        // ownerId requestedId 인지 검증
        if (groupChat.ownerId === dto.requestedId) {
          throw new ForbiddenException('onwer를 admin으로 등록할 수 없습니다.');
        }

        // userId가 admin인지 검증, owner인지 검증
        const isAdminUser = groupChat.admin.find(
          (admin) => admin.id === dto.userId,
        );
        const isOwnerUser = groupChat.ownerId === dto.userId;
        if (!isAdminUser && !isOwnerUser) {
          throw new ForbiddenException('admin 권한이 없습니다.');
        }

        //유저 참여 검증
        const isJoinedUser = groupChat.joinedUser.find(
          (user) => user.id === dto.requestedId,
        );
        if (!isJoinedUser) {
          throw new NotFoundException('참여하지 않은 유저입니다.');
        }

        // joinUser에서 requestedId를 제거
        groupChat.joinedUser = groupChat.joinedUser.filter(
          (joinedUser) => joinedUser.id !== dto.requestedId,
        );

        // groupChat에 requestedId를 admin으로 추가
        const user = await manager.getRepository(User).findOne({
          where: { id: dto.requestedId },
        });
        if (!user) {
          throw new NotFoundException('user가 존재하지 않습니다.');
        }
        // db에 저장
        groupChat.admin.push(user);
        await manager.save(GroupChat, groupChat);
      },
    );
  }

  async deleteAdmin(groupChatId: number, dto: DeleteAdminDto) {
    // 그룹 채팅방에서 admin을 제거하는 로직
    await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        const groupChat: GroupChat = await manager
          .getRepository(GroupChat)
          .findOne({
            where: {
              groupChatId: groupChatId,
            },
            relations: {
              admin: true,
              joinedUser: true,
            },
          });

        if (!groupChat) {
          throw new NotFoundException();
        }
        const isOwner = groupChat.ownerId === dto.userId;

        // userId와 requestedId가 admin인지 검증
        const isAdminUser = groupChat.admin.find(
          (admin) => admin.id === dto.userId,
        );
        const adminToRemove = groupChat.admin.find(
          (admin) => admin.id === dto.requestedId,
        );

        if (!isAdminUser && !isOwner) {
          throw new ForbiddenException('admin 권한이 없습니다.');
        }

        if (!adminToRemove) {
          throw new NotFoundException('admin이 아닙니다.');
        }

        if (isAdminUser && adminToRemove) {
          throw new ForbiddenException('admin끼리 admin을 제거할 수 없습니다.');
        }

        // joinUser로 requestedId를 추가
        groupChat.joinedUser.push(
          groupChat.admin.find((admin) => admin.id === dto.requestedId),
        );

        // admin에서 requestedId를 제거
        groupChat.admin = groupChat.admin.filter(
          (admin) => admin.id !== dto.requestedId,
        );

        await manager.save(GroupChat, groupChat);
      },
    );
  }

  async ban(groupChatId: number, dto: BanDto) {
    //1. owner/admin 유저인지 검증
    //2. banUser가 joinedUser인지 검증
    //3. banUser를 joinedUser에서 제거
    //4. banUser를 banUser에 추가

    await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        //1.
        const groupChat: GroupChat = await manager
          .getRepository(GroupChat)
          .findOne({
            where: {
              groupChatId: groupChatId,
            },
            relations: {
              owner: true,
              admin: true,
              joinedUser: true,
              bannedUser: true,
            },
          });
        if (!groupChat) {
          throw new NotFoundException();
        }
        const isAdminUser = groupChat.admin.find(
          (admin) => admin.id === dto.userId,
        );
        const isOwnerUser = groupChat.owner.id === dto.userId;
        if (!isAdminUser && !isOwnerUser) {
          throw new ForbiddenException('admin 권한이 없습니다.');
        }
        //2.

        const isJoinedUser = groupChat.joinedUser.find(
          (user) => user.id === dto.bannedId,
        );
        if (!isJoinedUser) {
          throw new NotFoundException('참여하지 않은 유저입니다.');
        }

        //3.
        // joinUser에서 banUserId를 제거
        groupChat.joinedUser = groupChat.joinedUser.filter(
          (joinedUser) => joinedUser.id !== dto.bannedId,
        );

        //4.
        // groupChat에 banUserId를 banUser로 추가
        const user = await manager.getRepository(User).findOne({
          where: { id: dto.bannedId },
        });

        if (!user) {
          throw new NotFoundException('user가 존재하지 않습니다.');
        }
        // db에 저장
        groupChat.bannedUser.push(user);
        await manager.update(GroupChat, { groupChatId }, groupChat);
      },
    );
  }

  async getJoinedUser(groupChatId: number) {
    await this.groupChatRepository.findOne({
      where: { groupChatId },
      relations: {
        joinedUser: true,
        admin: true,
        owner: true,
      },
      select: {
        joinedUser: {
          id: true,
          nickName: true,
          profile: true,
        },
      },
    });
  }

  async getJoinedGroupChatList(userId: number) {
    return await this.groupChatRepository.find({
      where: [
        {
          joinedUser: {
            id: userId,
          },
        },
        {
          admin: {
            id: userId,
          },
        },
        {
          owner: {
            id: userId,
          },
        },
      ],
      relations: {
        owner: true,
        joinedUser: true,
        admin: true,
      },
      select: {
        groupChatId: true,
        chatName: true,
        levelOfPublicity: true,
        curParticipants: true,
        maxParticipants: true,
        owner: {
          id: true,
          nickName: true,
          profile: true,
        },
        joinedUser: {
          id: true,
          nickName: true,
          profile: true,
        },
        admin: {
          id: true,
          nickName: true,
          profile: true,
        },
      },
    });
  }

  /**
   * @todo : mute/ban 기능 추가
   * */
  async sendGroupMessage(messageDto: GroupChatMessageDto) {
    return await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        //1. 그룹채팅방 존재확인
        const groupChat = await manager.getRepository(GroupChat).findOne({
          where: [
            {
              groupChatId: messageDto.receivedGroupChatId,
              ownerId: messageDto.senderId,
            },
            {
              groupChatId: messageDto.receivedGroupChatId,
              admin: { id: messageDto.senderId },
            },
            {
              groupChatId: messageDto.receivedGroupChatId,
              joinedUser: { id: messageDto.senderId },
            },
          ],
          relations: {
            joinedUser: true,
            admin: true,
          },
        });
        if (!groupChat) {
          throw new NotFoundException('유저/그룹 채팅방이 존재하지 않습니다.');
        }

        //2. 그룹 채팅방에 메세지 저장
        const newMessageInfo = await manager.getRepository(MessageInfo).insert({
          message: messageDto.message,
          senderId: messageDto.senderId,
        });

        const msg = await manager.getRepository(GroupChatMessage).insert({
          messageInfoId: newMessageInfo.identifiers[0].messageId,
          receivedGroupChatId: messageDto.receivedGroupChatId,
        });

        //3. Request를 저장.
        return await manager.getRepository(GroupChatMessage).findOne({
          relations: {
            messageInfo: {
              sender: true,
            },
          },
          where: {
            groupChatMessageId: msg.identifiers[0].groupChatMessageId,
          },
          select: {
            groupChatMessageId: true,
            receivedGroupChatId: true,
            messageInfo: {
              messageId: true,
              message: true,
              createdAt: true,
              sender: {
                id: true,
                nickName: true,
                profile: true,
              },
            },
          },
        });
      },
    );
  }

  /**
   * @todo : block 기능 추가
   * */
  async sendDirectMessage(messageDto: DirectMessageDto) {
    return await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        const receiver = await manager.getRepository(User).findOne({
          where: { id: messageDto.receiverId },
        });

        if (!receiver) {
          throw new NotFoundException('받는 사람이 존재하지 않습니다.');
        }

        const newMessageInfo = await manager.getRepository(MessageInfo).insert({
          message: messageDto.message,
          senderId: messageDto.senderId,
        });

        const msg = await manager.getRepository(DirectMessage).insert({
          messageInfoId: newMessageInfo.identifiers[0].messageId,
          receivedUserId: messageDto.receiverId,
        });

        return await manager.getRepository(DirectMessage).findOne({
          where: {
            directMessageId: msg.identifiers[0].directMessageId,
          },
          relations: {
            messageInfo: {
              sender: true,
            },
          },
          select: {
            directMessageId: true,
            receivedUserId: true,
            receivedUser: {
              chatSocketId: true,
            },
            messageInfo: {
              messageId: true,
              message: true,
              createdAt: true,
              sender: {
                id: true,
                nickName: true,
                profile: true,
              },
            },
          },
        });
      },
    );
  }

  async mute(dto: MuteRequestDto) {
    // 그룹 채팅방에서 유저를 뮤트하는 로직
    await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        const groupChat: GroupChat = await manager
          .getRepository(GroupChat)
          .findOne({
            where: {
              groupChatId: dto.groupChatId,
            },
            relations: {
              admin: true,
              joinedUser: true,
              mutedUser: true,
            },
          });

        if (!groupChat) {
          throw new NotFoundException();
        }

        // userId가 owner인지 검증
        const isOwnerUser = groupChat.owner.id === dto.userId;

        // userId가 admin인지 검증
        const isAdminUser = groupChat.admin.find(
          (admin) => admin.id === dto.requestUserId,
        );

        if (!isAdminUser && !isOwnerUser) {
          throw new ForbiddenException('권한이 없습니다.');
        }

        // mutedUser가 joinedUser인지 검증

        const isJoinedUser = groupChat.joinedUser.find(
          (user) => user.id === dto.userId,
        );
        if (!isJoinedUser) {
          throw new NotFoundException('참여하지 않은 유저입니다.');
        }

        // mutedUser가 mutedUser에 이미 존재하는지 검증
        const isMutedUser = groupChat.mutedUser.find(
          (user) => user.id === dto.userId,
        );
        if (isMutedUser) {
          throw new ForbiddenException('이미 뮤트된 유저입니다.');
        }

        // mutedUser를 mutedUser에 추가
        const user = await manager.getRepository(User).findOne({
          where: { id: dto.userId },
        });

        if (!user) {
          throw new NotFoundException('user가 존재하지 않습니다.');
        }
        // db에 저장
        groupChat.mutedUser.push(user);
        await manager.save(GroupChat, groupChat);
      },
    );
  }

  /**
   * @TODO 에러 핸들링 // 유저가 존재하지 않을 경우
   * */
  async getDirectMessage(
    dto: GetDirectMessageDto,
  ): Promise<DirectMessageResponse[]> {
    return await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        return await manager.getRepository(DirectMessage).find({
          where: [
            {
              receivedUserId: dto.userId,
              messageInfo: {
                senderId: dto.targetId,
              },
            },
            {
              receivedUserId: dto.targetId,
              messageInfo: {
                senderId: dto.userId,
              },
            },
          ],
          relations: {
            messageInfo: {
              sender: true,
            },
            receivedUser: true,
          },
          select: {
            directMessageId: true,
            receivedUser: {
              id: true,
              nickName: true,
              profile: true,
            },
            receivedUserId: true,
            messageInfo: {
              sender: {
                id: true,
                nickName: true,
                profile: true,
              },
              createdAt: true,
              message: true,
            },
          },
          order: {
            messageInfo: {
              createdAt: 'ASC',
            },
          },
        });
      },
    );
  }

  /**
   * @TODO 에러핸들링 // user/groupChat 존재하지 않을 때
   * */
  async getGroupChatMessages(dto: GetGroupMessageDto) {
    return await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        return await manager.getRepository(GroupChatMessage).find({
          where: {
            receivedGroupChatId: dto.groupChatId,
          },
          relations: {
            messageInfo: {
              sender: true,
            },
          },
          select: {
            groupChatMessageId: true,
            receivedGroupChatId: true,
            messageInfo: {
              sender: {
                id: true,
                nickName: true,
                profile: true,
              },
              createdAt: true,
              message: true,
            },
          },
          order: {
            messageInfo: {
              createdAt: 'ASC',
            },
          },
        });
      },
    );
  }

  async blockUser(dto: BlockRequestDto) {
    await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        // 유저가 존재하는지 검증

        const blockUser = await manager.getRepository(User).findOne({
          where: {
            id: dto.userId,
          },
        });
        if (!blockUser) {
          throw new NotFoundException('차단할 유저가 존재하지 않습니다.');
        }

        const blockedUser = await manager.getRepository(User).findOne({
          where: {
            id: dto.blockedUserId,
          },
        });
        if (!blockedUser) {
          throw new NotFoundException('차단할 유저가 존재하지 않습니다.');
        }

        // 이미 차단된 유저인지 검증
        const isBlockedUser = await manager
          .getRepository(BlockUserList)
          .findOne({
            where: {
              userId: dto.userId,
              blockedUserId: dto.blockedUserId,
            },
          });

        if (isBlockedUser) {
          throw new ForbiddenException('이미 차단된 유저입니다.');
        }

        await manager.getRepository(BlockUserList).insert(dto);
      },
    );
  }

  async unBlockUser(dto: UnBlockRequestDto) {
    await this.blockUserListRepository.delete({
      userId: dto.userId,
      blockedUserId: dto.unBlockedUserId,
    });
  }

  //   async getSendableUser(dto: GetSendableUserDto) {
  //     if (dto.groupChatId) {
  //       // 그룹 채팅방에서 sender를 mute/block하지 않은 유저를 가져옴
  //       return await this.groupChatRepository.manager.transaction(
  //         async (manager: EntityManager) => {
  //           const groupChat = await manager.getRepository(GroupChat).findOne({
  //             where: {
  //               groupChatId: dto.groupChatId,
  //               mutedUser: {
  //                 id: Not(dto.userId),
  //               },
  //             },
  //             relations: {
  //               joinedUser: true,
  //             },
  //           });
  //         },
  //       );
  //     } else {
  //     }
  //   }
}
