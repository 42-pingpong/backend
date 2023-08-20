import { CreateGroupChatDto } from 'src/restapi/chat/dto/create-group-chat.dto';

export class ChatFactory {
  /**
   * @brief Creates a chat with the given owner and identifier
   *
   * @param ownerId number, 소유자의 아이디
   * @param id number, 채팅방 프로퍼티에 붙일 id
   */
  createPubChat(ownerId: number, id: number): CreateGroupChatDto {
    const newChat = new CreateGroupChatDto();

    newChat.chatName = 'Test Chat' + id;
    newChat.levelOfPublicity = 'Pub';
    newChat.maxParticipants = 4;
    newChat.ownerId = ownerId;

    return newChat;
  }

  createPrivChat(ownerId: number, id: number): CreateGroupChatDto {
    const newChat = new CreateGroupChatDto();

    newChat.chatName = 'Test Chat' + id;
    newChat.levelOfPublicity = 'Prot';
    newChat.maxParticipants = 4;
    newChat.ownerId = ownerId;

    return newChat;
  }
}
