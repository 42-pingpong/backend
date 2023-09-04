import { ApiProperty } from '@nestjs/swagger';
import { MessageInfo } from '@app/common/entities/messageInfo.entity';

export class GroupChatMessageResponse {
  groupChatMessageId: number;

  receivedGroupChatId: number;

  messageInfo: MessageInfo;
}
