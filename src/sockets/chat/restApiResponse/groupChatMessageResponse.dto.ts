import { ApiProperty } from '@nestjs/swagger';
import { MessageInfo } from 'src/entities/chat/messageInfo.entity';

export class GroupChatMessageResponse {
  groupChatMessageId: number;

  receivedGroupChatId: number;

  messageInfo: MessageInfo;
}
