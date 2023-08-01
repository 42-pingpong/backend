import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { NotFoundError } from 'rxjs';
import { AddAdminDto } from './dto/add-admin.dto';

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

  async addAdmin(groupChatId: number, userId: AddAdminDto, id: number) {
    // 그룹 채팅방에 admin을 추가하는 로직
    // 미완성
    //1. 그룹 안의 admin과 owner 정보를 뽑아내는 로직
    const groupChatAdmin = await this.groupChatRepository.find({
      where: [
        {
          groupChatId: groupChatId,
          admin: {
            id: userId.adminId,
          },
        },
        {
          groupChatId: groupChatId,
          owner: {
            id: userId.ownerId,
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
      },
    });
    console.log(groupChatAdmin);
    if (!groupChatAdmin) {
      throw new NotFoundException();
    }
    //2. 그룹 안의 owner 정보와 요청한 유저의 id를 비교하는 로직
    if (groupChatAdmin.find((admin) => admin.ownerId !== userId.adminId)) {
      throw new ForbiddenException();
    }
    //3. 그룹 안의 admin 정보에 요청한 유저의 id가 있는지 확인하는 로직
    // if (groupChatAdmin.find((admin) => admin.admin.id !== userId)) {
    //   throw new ForbiddenException();
    // }
    //이거 안돼여 ㅜㅜ

    // await this.groupChatRepository.save({ id });
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

  async setPriv(groupChatId: number, levelOfPublicity: number) {
    // 그룹 채팅방의 priv를 설정하는 로직
    // await this.groupChatRepository.save(groupChatId, {
    //   levelOfPublicity: levelOfPublicity,
    // });
  }

  async setPub(groupChatId: number, levelOfPublicity: number) {
    // 그룹 채팅방의 pub를 설정하는 로직
    // await this.groupChatRepository.save(groupChatId, {
    //   levelOfPublicity: levelOfPublicity,
    // });
  }

  async saveDmChat(groupChatId: number, userId: number, content: string) {
    // dm 채팅방을 저장하는 로직
  }

  async saveGroupChat(groupChatId: number, userId: number, content: string) {
    // 그룹 채팅방을 저장하는 로직
  }

  async getDmChat(groupChatId: number, userId: number) {
    // dm 채팅방을 조회하는 로직
  }

  async ban(groupChatId: number, userId: number) {
    // 그룹 채팅방에서 유저를 밴하는 로직
  }

  async mute(groupChatId: number, userId: number) {
    // 그룹 채팅방에서 유저를 뮤트하는 로직
  }
}
