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
    console.log('chat socket handleConnection', client.id);
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;

    //GroupChat을 위한 코드
    //클라이언트 연결 시, 클라이언트가 속한 채팅방의 정보를 받아 room에 join한다.
    const joinedGroupChatList =
      await this.chatGatewayService.getJoinedGroupChatList(
        userId,
        client.handshake.auth.token,
      );

    for (const groupChat of joinedGroupChatList) {
      client.join(groupChat.groupChatId.toString());
    }

    //Direct Message를 위한 코드
    //클라이언트의 chatSocketId를 저장한다.
    //비동기로 처리해서 빠르게 처리.
    await this.chatGatewayService.login(
      userId,
      client.id,
      client.handshake.auth.token,
    );
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
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;
    return await this.chatGatewayService.getGroupChatList();
  }

  /**
   * @description
   * - 클라이언트가 채팅방을 생성 요청했을 때 실행된다.
   * - 채팅방을 생성하고, group-chat-update 이벤트를 발생시켜 모든 클라이언트에게 채팅방 목록을 전달한다.
   **/
  @SubscribeMessage('create-room')
  async createChatRoom(client: any, payload: CreateGroupChatDto) {
    console.log('create-room', payload);
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;
    const chat = await this.chatGatewayService.createGroupChat(payload);
    this.server.emit('group-chat-update', chat);
  }

  @SubscribeMessage('join-room')
  async joinChatRoom(client: any, groupChatId: string) {
    console.log('join-room', groupChatId);
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;

    try {
      await this.chatGatewayService.joinGroupChat(
        +groupChatId,
        userId,
        client.handshake.auth.token,
      );
      client.join(groupChatId);
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('leave-room')
  leaveChatRoom(client: any, roomId: string) {
    client.leave(roomId);
  }

  @SubscribeMessage('chat-message')
  handleMessage(client: Socket, payload: ChatDTO): any {
    client.broadcast.to(payload.roomId).emit('chat-message', payload);
    // const room = ChatRoomList.find((data) => data.roomId === payload.roomId);
    // room.log.push(payload);
    return payload;
  }
}
