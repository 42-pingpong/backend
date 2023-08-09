import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatGatewayService } from './chat.gateway.service';
import { CreateGroupChatDto } from './dto/create-chat.dto';

export interface ChatDTO {
  roomId: string;
  id?: number;
  nickname: string;
  text: string;
}

export interface ChatRoomDTO {
  log?: ChatDTO[];
  chatName: string;
  password?: string;
  levelOfPublicity: string;
  currentParticipants: number;
  maxParticipants: number;
  ownerId?: number;
  roomId: string;
}

let roomId = 1;

const ChatRoomList: ChatRoomDTO[] = [];

/**
 * @brief chat gateway
 *
 * @description
 * @link [](https://app.diagrams.net/#G1GES8rBEs5p8bRXtweH7BBFLKYITlAu1W)
 * */
// The @WebSocketGateway() decorator defines the WebSocket server.
@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
  //ping을 보내고 pong을 받지 못하면 연결을 끊는다.
  pingTimeout: 2500,
  //ping을 보내는 주기 1000ms = 1초
  pingInterval: 5000,
  //namespace에 성공적으로 연결되지 않으면 connectTimeout이후 연결을 끊는다.
  connectTimeout: 5,
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: any;

  constructor(private readonly chatGatewayService: ChatGatewayService) {}

  /**
   * @brief lifecycle hook
   * @param any client(클라이언트)
   * @param any][] args(인자).
   * @description
   * - 클라이언트가 연결되었을 때 실행되는 함수
   * - 클라이언트가 연결되었을 때, 클라이언트의 정보를 받아올 수 있다.
   * - chat은 기본적으로 전역상태로 enable되어있으므로, 모든 클라이언트가 연결되었을 때 실행된다.
   */
  @SubscribeMessage('connect')
  async handleConnection(client: any, ...args: any[]) {
    if (client.handshake.headers.authorization !== undefined) {
      console.log('chat socket handleConnection', client.id);
      const userId = this.chatGatewayService.getSub(
        client.handshake.headers.authorization,
      );

      //GroupChat을 위한 코드
      //클라이언트 연결 시, 클라이언트가 속한 채팅방의 정보를 받아 room에 join한다.
      const joinedGroupChatList =
        await this.chatGatewayService.getJoinedGroupChatList(
          userId,
          client.handshake.headers.authorization,
        );

      for (const groupChat of joinedGroupChatList) {
        client.join(groupChat.groupChatId.toString());
      }

      //Direct Message를 위한 코드
      //클라이언트의 chatSocketId를 저장한다.
      //비동기로 처리해서 빠르게 처리.
      this.chatGatewayService.login(
        userId,
        client.id,
        client.handshake.headers.authorization,
      );
    }
  }

  /**
   * @brief lifecycle hook
   * @param any client(클라이언트)
   * @param any][] args(인자).
   * @description
   * - 클라이언트가 연결이 끊겼을 때 실행되는 함수
   * - 클라이언트가 연결이 끊겼을 때, 클라이언트의 정보를 받아올 수 있다.
   * - 클라이언트, 즉 browser가 종료되었을 때, 혹은 client의 의도적인 logout시 실행된다.
   * */
  @SubscribeMessage('chat-logout')
  handleDisconnect(client: any, ...args: any[]) {
    console.log('handleDisconnect', args);
    return 'Goodbye world!';
  }

  /**
   * @description
   * - 클라이언트에게 모든 채팅방 목록을 전달한다.
   * */
  @SubscribeMessage('group-chat-list')
  async getChatRoomList(client: any) {
    return await this.chatGatewayService.getGroupChatList();
  }

  /**
   * @description
   * - 클라이언트가 채팅방을 생성 요청했을 때 실행된다.
   * - 채팅방을 생성하고, group-chat-update 이벤트를 발생시켜 모든 클라이언트에게 채팅방 목록을 전달한다.
   **/
  @SubscribeMessage('create-room')
  async createChatRoom(client: any, payload: CreateGroupChatDto) {
    const chat = await this.chatGatewayService.createGroupChat(payload);
    this.server.broadcast.emit('group-chat-update', chat);
  }

  @SubscribeMessage('join-room')
  async joinChatRoom(client: any, roomId: string) {
    console.log('join-room', roomId);
    const userId = this.chatGatewayService.getSub(
      client.handshake.headers.authorization,
    );

    await this.chatGatewayService.joinGroupChat(
      +roomId,
      userId,
      client.handshake.headers.authorization,
    );
    client.join(roomId);
  }

  @SubscribeMessage('leave-room')
  leaveChatRoom(client: any, roomId: string) {
    client.leave(roomId);
  }

  @SubscribeMessage('chat-message')
  handleMessage(client: Socket, ...payload: ChatDTO[]): any {
    client.broadcast.to(payload[0].roomId).emit('chat-message', payload[0]);
    // const room = ChatRoomList.find((data) => data.roomId === payload[0].roomId);
    // room.log.push(payload[0]);
    return payload[0];
  }
}
