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
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: any;

  constructor(private readonly chatGatewayService: ChatGatewayService) {}

  /**
   * @brief lifecycle hook
   * @param any server(서버)
   * @return void
   * @description
   * - 서버가 초기화 되었을 때 실행되는 함수
   * - 즉, Nest Injector가 생성되고 ChatGateway 인스턴스가 만들어진 후에 실행된다.
   */
  async afterInit(server: any) {
    console.log('afterInit');
    //database의 groupchat을 가져와서 WebSocket서버와 동기화한다.
  }

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
    const groupChatList = await this.chatGatewayService.getGroupChatList();
    client.emit('group-chat-list', groupChatList);
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

  @SubscribeMessage('connect')
  updateChatRoom(client: any, ...payload: ChatRoomDTO[]): any {
    client.broadcast.emit('group-chat-update', payload);
    return payload;
  }

  @SubscribeMessage('chat-message')
  handleMessage(client: Socket, ...payload: ChatDTO[]): any {
    client.broadcast.to(payload[0].roomId).emit('chat-message', payload[0]);
    // const room = ChatRoomList.find((data) => data.roomId === payload[0].roomId);
    // room.log.push(payload[0]);
    return payload[0];
  }

  @SubscribeMessage('create-room')
  createChatRoom(client: any, ...payload: ChatRoomDTO[]): any {
    payload[0].roomId = roomId.toString();
    ChatRoomList.push(payload[0]);
    client.broadcast.emit('group-chat-update', payload[0]);
    roomId++;
    return payload[0];
  }

  @SubscribeMessage('join-room')
  enterChatRoom(client: any, roomId: string): any {
    client.join(roomId);
    // const room = ChatRoomList.find((data) => data.roomId === roomId);
    // client.emit('group-chat-info', room);
    // console.log(room.log);
  }

  // @SubscribeMessage('group-chat-info')
  // getChatRoomInfo(client: any, roomId: string): any {
  // }

  @SubscribeMessage('leave-room')
  leaveChatRoom(client: any, roomId: string): any {
    client.leave(roomId);
  }

  @SubscribeMessage('group-chat-list')
  getChatRoomList(client: any): ChatRoomDTO[] {
    return ChatRoomList;
  }
}
