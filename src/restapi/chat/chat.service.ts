import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { Repository } from 'typeorm';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(GroupChat)
    private readonly groupChatRepository: Repository<GroupChat>,
  ) {}
  private messages: any[] = []; // 메모리 상에서 간단히 채팅 메시지를 저장하는 예제이므로, 실제 프로젝트에서는 데이터베이스 등을 사용합니다.

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
    await this.groupChatRepository.manager.transaction(async (manager) => {
      const curGroupChat = await manager.findOne(GroupChat, {
        where: { groupChatId: groupChatId },
        select: ['curParticipants'],
      });

      if (curGroupChat.curParticipants >= updateGroupChatDto.maxParticipants) {
        throw new ForbiddenException();
      }

      await manager.update(
        GroupChat,
        { groupChatId: groupChatId },
        updateGroupChatDto,
      );
    });
  }

  async addAdmin(groupChatId: number, adminId: number) {
    // 그룹 채팅방에 admin을 추가하는 로직
    // 미완성
    // 분기문으로 인가된 유저인지 확인하는 로직 필요
    await this.groupChatRepository.save({
      groupChatId: groupChatId,
    });
  }

  async deleteAdmin(groupChatId: number, addAdminId: number) {
    // 그룹 채팅방에서 admin을 삭제하는 로직
    // 미완성
    // 분기문으로 인가된 유저인지 확인하는 로직 필요
    await this.groupChatRepository.delete({
      groupChatId: groupChatId,
    });
  }

  sendMessage(messageData: any) {
    // 새로운 채팅 메시지를 생성하고 저장하는 로직
    const newMessage = {
      id: Date.now().toString(),
      text: messageData.text,
      user: messageData.user,
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  getAllMessages() {
    // 저장된 모든 채팅 메시지를 반환하는 로직
    return this.messages;
  }
}
