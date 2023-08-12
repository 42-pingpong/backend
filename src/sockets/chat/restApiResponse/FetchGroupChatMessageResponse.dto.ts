import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { MessageInfo } from 'src/entities/chat/messageInfo.entity';

/**
 * @link http://localhost:10002/api/#/chat/ChatController_getGroupMessages
 * */
export class FetchGroupChatMessageResponseDto {
  groupChatMessageId: number;

  messageInfo: MessageInfo;

  receivedGroupChat: GroupChat;
}
