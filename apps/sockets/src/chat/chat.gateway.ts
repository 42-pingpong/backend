import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatGatewayService } from './chat.gateway.service';
import { CreateGroupChatDto } from './dto/create-chat.dto';
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
import { GroupChatMessageResponse } from './restApiResponse/groupChatMessageResponse.dto';
import { JoinRoomResponse } from './restApiResponse/joinRoomResponse.dto';
import { JoinGroupChatDto } from './request/joinGroupChat.dto';
import { BanDto } from './request/ban.dto';
import { MuteUserResponseDto } from './restApiResponse/muteUserResponse.dto';
import { UnMuteUserResponseDto } from './restApiResponse/unMuteUserResponse.dto';
import { KickUserResponseDto } from './restApiResponse/kickUserResponse.dto';
import { BanUserResponseDto } from './restApiResponse/banUserResponse.dto';
import { UnBanUserResponseDto } from './restApiResponse/unBanUserResponse.dto';
import { goPingPongDto } from './request/goPingPong.dto';
import { SendableGroupchatUserList } from './restApiResponse/sendableUserList.dto';
import { User } from '@app/common';

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
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;
    const chat = await this.chatGatewayService.createGroupChat(payload);
    this.server.emit('group-chat-update', chat);
  }

  @SubscribeMessage('join-room')
  async joinChatRoom(client: Socket, groupChatDto: JoinGroupChatDto) {
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;

    try {
      const resPonse: JoinRoomResponse =
        await this.chatGatewayService.joinGroupChat(
          groupChatDto,
          client.handshake.auth.token,
        );
      await client.join(groupChatDto.groupChatId.toString());
      this.server
        .to(groupChatDto.groupChatId.toString())
        .emit('join-room', resPonse);
    } catch (e) {
      if (e.response.data.message === '비밀번호가 일치하지 않습니다.')
        client.emit('password-error', e.response.data);
      else client.emit('error', e.response.data);
    }
  }

  /**
   * @description
   * - 클라이언트가 그룹채팅방에서 메시지를 보냈을 때 실행된다.
   * - 메시지를 저장하고, 그룹채팅방에 속한 모든 클라이언트에게 메시지를 전달한다.
   * */
  @SubscribeMessage('group-message')
  async handleGroupMessage(client: Socket, dto: GroupChatMessageDto) {
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;

    try {
      //block/mute에 상관없이 메시지를 저장한다.
      const responseBody: GroupChatMessageResponse =
        await this.chatGatewayService.saveGroupChatMessage(
          dto,
          client.handshake.auth.token,
        );

      const sendableUserList: User[] =
        await this.chatGatewayService.getSendableGroupchatUserList(
          dto,
          client.handshake.auth.token,
        );

      for (const user of sendableUserList) {
        if (user.chatSocketId) {
          this.server.to(user.chatSocketId).emit('group-message', responseBody);
        } else {
          /**
           * @TODO client 연결 안되어있을때, request에 추가하기
           * */
          // this.server.of('status').emit('group-message-alarm', responseBody);
        }
      }
    } catch (e) {
      console.log(e.message);
      console.log(e);
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
        //sender에게도 메시지 전달해줘요
        client.emit('direct-message', responseBody);
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
      const data: DirectMessageResponse =
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
      const data: GroupChatMessageResponse =
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
  async blockUser(client: Socket, dto: BlockUserDto) {
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;
    try {
      await this.chatGatewayService.blockUser(dto, client.handshake.auth.token);
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('unblock-user')
  async unblockUser(client: Socket, dto: UnblockUserDto) {
    const userId = this.chatGatewayService.getSub(client.handshake.auth.token);
    if (userId === null) return;
    try {
      await this.chatGatewayService.unBlockUser(
        dto,
        client.handshake.auth.token,
      );
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('kick-user')
  async kickUser(client: Socket, dto: KickUserDto) {
    try {
      const kickedUser: KickUserResponseDto =
        await this.chatGatewayService.kickUser(
          dto,
          client.handshake.auth.token,
        );

      //group 내 모든 유저들에게 groupId / kickedUserId 전달.
      this.server.in(dto.groupChatId.toString()).emit('kick-user', kickedUser);
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('ban-user')
  async banUser(client: Socket, dto: BanDto) {
    try {
      const bannedUser: BanUserResponseDto =
        await this.chatGatewayService.banUser(dto, client.handshake.auth.token);
      //group 내 모든 유저들에게 groupId / bannedUserId 전달.
      //ban-user room 에 보내고
      this.server.in(dto.groupChatId.toString()).emit('ban-user', bannedUser);
      //ban-user leave
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('unban-user')
  async unbanUser(client: Socket, dto: UnBanUserDto) {
    try {
      const unbannedUser: UnBanUserResponseDto =
        await this.chatGatewayService.unBanUser(
          dto,
          client.handshake.auth.token,
        );

      //group 내 모든 유저들에게 groupId / bannedUserId 전달.
      this.server
        .in(dto.groupChatId.toString())
        .emit('unban-user', unbannedUser);
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('mute-user')
  async muteUser(client: Socket, dto: MuteUserDto) {
    try {
      const mutedUser: MuteUserResponseDto =
        await this.chatGatewayService.muteUser(
          dto,
          client.handshake.auth.token,
        );

      this.server.to(dto.groupChatId.toString()).emit('mute-user', mutedUser);
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('unmute-user')
  async unmuteUser(client: Socket, dto: UnmuteUserDto) {
    console.log('unmute-user');
    try {
      const unmutedUser: UnMuteUserResponseDto =
        await this.chatGatewayService.unMuteUser(
          dto,
          client.handshake.auth.token,
        );

      this.server
        .to(dto.groupChatId.toString())
        .emit('unmute-user', unmutedUser);
    } catch (e) {
      console.log(e);
      client.emit('error', e.message);
    }
  }

  @SubscribeMessage('go-pingpong')
  goPingPong(client: any, dto: goPingPongDto) {
    this.server.to(dto.groupChatId.toString()).emit('go-pingpong', dto);
  }

  @SubscribeMessage('go-pingpong-accept')
  goPingPongAccept(client: any, dto: goPingPongDto) {
    this.server.to(dto.groupChatId.toString()).emit('go-pingpong-accept', dto);
  }

  @SubscribeMessage('go-pingpong-reject')
  goPingPongReject(client: any, payload: any) {
    if (payload[1] === 'N') {
      this.server
        .to(payload[0].groupChatId.toString())
        .emit('go-pingpong-reject', payload);
    } else if (payload[1] === 'X') {
      this.server
        .to(payload[0].groupChatId.toString())
        .emit('go-pingpong-reject', payload);
    }
  }

  @SubscribeMessage('leave-room')
  async leaveChatRoom(client: any, roomId: string) {
    client.leave(roomId);
    const groupChat: JoinRoomResponse =
      await this.chatGatewayService.leaveGroupChat(
        +roomId,
        client.handshake.auth.token,
      );
    this.server.to(roomId.toString()).emit('leave-room', groupChat);
  }
}
