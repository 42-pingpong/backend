import { MessageInfo } from 'src/entities/chat/messageInfo.entity';
import { User } from 'src/entities/user/user.entity';

/**
 * @link http://localhost:10002/api/#/chat/ChatController_getDirectMessages
 * */
export class FetchDirectMessageResponseDto {
  directMessageId: number;

  messageInfo: MessageInfo;

  receivedUser: User;
}
