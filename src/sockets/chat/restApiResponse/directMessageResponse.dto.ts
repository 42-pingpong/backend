import { MessageInfo } from 'src/entities/chat/messageInfo.entity';
import { User } from 'src/entities/user/user.entity';

export class DirectMessageResponse {
  directMessageId: number;

  messageInfo: MessageInfo;

  receivedUserId: number;

  receivedUser: User;
}
