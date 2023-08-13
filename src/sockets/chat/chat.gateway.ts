import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatGatewayService } from './chat.gateway.service';
import { CreateGroupChatDto } from './dto/create-chat.dto';
import { BanUserDto } from './request/banUser.dto';
import { BlockUserDto } from './request/BlockUser.dto';
import { DirectMessageDto } from './request/directMessage.dto';
import { FetchDirectMessageDto } from './request/FetchDirectMessage.dto';
import { FetchGroupMessageDto } from './request/FetchGroupChatMessage.dto';
import { GroupChatMessageDto } from './request/groupChatMessage.dto';
import { KickUserDto } from './request/kickUser.dto';
import { MuteUserDto } from './request/muteUser.dto';
import { UnBanUserDto } from './request/unBanUser.dto';
import { UnblockUserDto } from './request/unBlockUser.dto';
import { UnmuteUserDto } from './request/unMute.dto';
import { DirectMessageResponse } from './restApiResponse/directMessageResponse.dto';
import { FetchDirectMessageResponseDto } from './restApiResponse/FetchDirectMessageResponse.dto';
import { FetchGroupChatMessageResponseDto } from './restApiResponse/FetchGroupChatMessageResponse.dto';
import { GroupChatMessageResponse } from './restApiResponse/groupChatMessageResponse.dto';

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

  /**
   * @description
   * - 클라이언트가 그룹채팅방에서 메시지를 보냈을 때 실행된다.
   * - 메시지를 저장하고, 그룹채팅방에 속한 모든 클라이언트에게 메시지를 전달한다.
   * */
  @SubscribeMessage('group-message')
  async handleMessage(client: Socket, dto: GroupChatMessageDto) {
    //TODO: 로그인 하지 않은 사용자는 메시지를 어떻게 처리할 것인가?
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;

    try {
      //block/mute에 상관없이 메시지를 저장한다.
      const responseBody: GroupChatMessageResponse =
        await this.chatGatewayService.saveGroupChatMessage(
          dto,
          client.handshake.auth.token,
        );
      //sender를 제외한 room의 모든 client에게 메시지를 전달한다.
      // 2. block/mute 처리된 사용자의 메세지는 전달되면 안됨.
      // block은 joined-user간 서로에게 메시지를 전달하지 않는다.
      // mute는 joined-user에게 메시지를 전달하지 않는다.
      // groupChatId의 joined-user-list를 가져와서, 해당 사용자가 block/mute 처리된 사용자인지 확인한다.
      client
        .to(responseBody.receivedGroupChatId.toString())
        .emit('group-message', responseBody);

      //sender에게도 메시지 전달
      client.emit('group-message', responseBody);
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  /**
   * @description
   * - 클라이언트가 1:1 채팅방에서 메시지를 보냈을 때 실행된다.
   * - 메시지를 저장하고, 해당 클라이언트에게 메시지를 전달한다.
   * */
  @SubscribeMessage('direct-message')
  async handleDirectMessage(client: Socket, dto: DirectMessageDto) {
    console.log('direct-message', dto);
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;
    try {
      const responseBody: DirectMessageResponse =
        await this.chatGatewayService.saveDirectMessage(
          dto,
          client.handshake.auth.token,
        );
      //client가 socket에 연결되어있는지 확인한다.
      if (responseBody?.receivedUser?.chatSocketId) {
        //client가 연결되어있다면, 해당 client에게 메시지를 전달한다.
        const socketId = responseBody.receivedUser.chatSocketId;
        delete responseBody.receivedUser;
        this.server.to(socketId).emit('direct-message', responseBody);
        //TODO: client가 연결되어있지 않다면, 어떻게 처리할 것인가?
        //TODO: client 알람 처리
      }
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  /**
   * @description
   * - DM을 가져온다.
   * */
  @SubscribeMessage('fetch-direct-message')
  async fetchDirectMessage(client: Socket, dto: FetchDirectMessageDto) {
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;
    try {
      const data: FetchDirectMessageResponseDto =
        await this.chatGatewayService.fetchDirectMessage(
          dto,
          client.handshake.auth.token,
        );
      client.emit('fetch-direct-message', data);
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  /**
   * @description
   * - 그룹채팅방의 메시지를 가져온다.
   * */
  @SubscribeMessage('fetch-group-message')
  async fetchGroupMessage(client: Socket, dto: FetchGroupMessageDto) {
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;
    try {
      const data: FetchGroupChatMessageResponseDto =
        await this.chatGatewayService.fetchGroupMessage(
          dto,
          client.handshake.auth.token,
        );
      client.emit('fetch-group-message', data);
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('block-user')
  async blockUser(client: Socket, dto: BlockUserDto) {}

  @SubscribeMessage('unblock-user')
  async unblockUser(client: Socket, dto: UnblockUserDto) {}

  @SubscribeMessage('mute-user')
  async muteUser(client: Socket, dto: MuteUserDto) {}

  @SubscribeMessage('unmute-user')
  async unmuteUser(client: Socket, dto: UnmuteUserDto) {}

  @SubscribeMessage('ban-user')
  async banUser(client: Socket, dto: BanUserDto) {}

  @SubscribeMessage('unban-user')
  async unbanUser(client: Socket, dto: UnBanUserDto) {}

  @SubscribeMessage('kick-user')
  async kickUser(client: Socket, dto: KickUserDto) {}
}
