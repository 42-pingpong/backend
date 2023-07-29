import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupChatDto } from './create-group-chat.dto';

export class UpdateGroupChatDto extends PartialType(CreateGroupChatDto) {
  // 그룹 채팅방 정보를 수정하는 DTO
  password?: string;
  levelOfPublicity?: string;
  maxParticipants?: number;
}
