import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(GroupChat)
    private readonly groupChatRepository: Repository<GroupChat>,
  ) {}

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

  async createGroupChat(createChatDto: CreateGroupChatDto) {
    // 그룹 채팅방을 생성하고 저장하는 로직
    await this.groupChatRepository.save(createChatDto);
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

  async addAdmin(groupChatId: number, adminId: number) {
    // 그룹 채팅방에 admin을 추가하는 로직
    // 미완성

    await this.groupChatRepository.manager.transaction(async (manager) => {
      //1. 그룹 안의 어드민 정보를 뽑아내는 로직
      const groupChatAdmin = await manager.getRepository(GroupChat).find({
        where: [
          {
            groupChatId: groupChatId,
            admin: {
              id: adminId,
            },
          },
          {
            groupChatId: groupChatId,
            owner: {
              id: adminId,
            },
          },
        ],
        relations: {
          admin: true,
          owner: true,
        },
        select: {
          ownerId: true,
          admin: true,
          // group안의 admin을 뽑을 때 어떻게 뽑아야할지 모르겠어여
        },
      });
      console.log(groupChatAdmin);
      // if (groupChatAdmin.find((admin) => admin.ownerId !== adminId)) {
      //   throw new ForbiddenException();
      // }
      // 분기문으로 인가된 유저인지 확인하는 로직 필요

      // await manager.getRepository(GroupChat).save(adminId);
    });
  }

  async deleteAdmin(groupChatId: number, addAdminId: number) {
    // 그룹 채팅방에서 admin을 삭제하는 로직
    // 미완성
    // 분기문으로 인가된 유저인지 확인하는 로직 필요
    // 삭제하려는 id가 admin에 있는지 확인하는 로직 필요
    await this.groupChatRepository.delete({
      groupChatId: groupChatId,
    });
  }
}

/**
 * 1. setPriv
 * 2. setPub
 * 3. saveDmChat
 * 4. saveGroupChat
 * 5. getDmChat
 * 6. getGroupChat
 * 7. ban
 * 8. mute
 */
