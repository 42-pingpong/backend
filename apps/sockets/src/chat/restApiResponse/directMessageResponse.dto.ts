import { MessageInfo } from '@app/common/entities/messageInfo.entity';
import { User } from '@app/common/entities/user.entity';

export class DirectMessageResponse {
  directMessageId: number;

  messageInfo: MessageInfo;

  receivedUserId: number;

  receivedUser: User;
}
