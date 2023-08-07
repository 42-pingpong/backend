import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { EntityManager, Join, Repository } from 'typeorm';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { NotFoundError } from 'rxjs';
import { User } from 'src/entities/user/user.entity';
import { AddAdminDto } from './dto/add-admin.dto';
import { DeleteAdminDto } from './dto/delete-admin.dto';
import { request } from 'http';
import { JoinGroupChatDto } from './dto/join-group-chat.dto';
import { BanDto } from './dto/ban.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(GroupChat)
    private readonly groupChatRepository: Repository<GroupChat>,
  ) {}

  async createGroupChat(createChatDto: CreateGroupChatDto) {
    // 그룹 채팅방을 생성하고 저장하는 로직
    await this.groupChatRepository.save(createChatDto);
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
    await this.groupChatRepository.manager.transaction(
      async (manager: EntityManager) => {
        // 그룹 채팅방의 현재 참여 인원 조회
        const groupChat: GroupChat = await manager
          .getRepository(GroupChat)
          .findOne({
            where: { groupChatId },
            relations: {
              joinedUser: true,
            },
          });
        if (!groupChat) {
          throw new NotFoundException('그룹 채팅방이 존재하지 않습니다.');
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

        groupChat.curParticipants++;
        groupChat.joinedUser.push(user);

        console.log('service:   ', groupChat);

        await manager.save(GroupChat, groupChat);
      },
    );
  }

  async addAdmin(groupChatId: number, dto: AddAdminDto) {
    // 그룹 채팅방에 admin을 추가하는 로직
    //1. 그룹 안의 admin과 owner 정보를 뽑아내는 로직

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
              owner: true,
              joinedUser: true,
            },
          });

        if (!groupChat) {
          throw new NotFoundException();
        }

        //유저 참여 검증
        const isJoinedUser = groupChat.joinedUser.find(
          (user) => user.id === dto.requestedId,
        );
        if (!isJoinedUser) {
          throw new ForbiddenException('참여하지 않은 유저입니다.');
        }

        groupChat.joinedUser = groupChat.joinedUser.filter(
          (joinedUser) => joinedUser.id !== dto.requestedId,
        );

        const isalreadyAdmin = groupChat.admin.find(
          (admin) => admin.id === dto.requestedId,
        );
        if (isalreadyAdmin) {
          throw new ConflictException('이미 admin 권한이 있습니다.');
        }
        if (groupChat.ownerId === dto.requestedId) {
          throw new ForbiddenException('onwer를 admin으로 등록할 수 없습니다.');
        }
        const isAdminUser = groupChat.admin.find(
          (admin) => admin.id === dto.userId,
        );
        const isOwnerUser = groupChat.owner.id === dto.userId;
        if (!isAdminUser && !isOwnerUser) {
          throw new ForbiddenException('admin 권한이 없습니다.');
        }
        const user = await manager.getRepository(User).findOne({
          where: { id: dto.requestedId },
        });
        if (!user) {
          throw new NotFoundException('user가 존재하지 않습니다.');
        }
        groupChat.admin.push(user);
        await manager.save(GroupChat, groupChat);
      },
    );
  }

  /**
   * @TODO 삭제 후 joinUser에 추가
   * */
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
              owner: true,
            },
          });

        if (!groupChat) {
          throw new NotFoundException();
        }
        const isAdminUser = groupChat.admin.find(
          (admin) => admin.id === dto.userId,
        );
        const adminToRemove = groupChat.admin.find(
          (admin) => admin.id === dto.requestedId,
        );
        if (isAdminUser) {
          if (adminToRemove)
            throw new ForbiddenException('admin 끼리는 삭제가 불가능합니다.');
        }

        if (!adminToRemove) {
          throw new NotFoundException('Admin not found in the group');
        }
        groupChat.admin = groupChat.admin.filter(
          (admin) => admin.id !== dto.requestedId,
        );
        await manager.save(GroupChat, groupChat);
      },
    );
  }

  async ban(groupChatId: number, dto: BanDto) {}

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

  // mute 테이블 아직 존재 X
  // async mute(groupChatId: number, userId: number) {
  //   // 그룹 채팅방에서 유저를 뮤트하는 로직
  // }
}
