import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/restapi/auth/Guards/accessToken.guard';
import { StatusProducer } from './status.producer';
import { ApiTags } from '@nestjs/swagger';
import { StatusService } from './status.service';
import { GetFriendResponseDto } from 'src/restapi/user/dto/get-friend-response.dto';
import { FriendRequestJobData } from 'src/interface/user.jobdata';

/**
 * @brief status gateway
 *
 * @description 유저 상태정보를 관리하는 gateway
 */
@ApiTags('status')
@WebSocketGateway({
  namespace: 'status',
  cors: {
    origin: '*',
  },
  pingTimeout: 2500,
  pingInterval: 1000,
  connectionTimeout: 1000,
  transports: ['websocket'],
})
export class StatusGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: any;

  constructor(
    private readonly statusProducer: StatusProducer,
    private readonly statusService: StatusService,
  ) {}

  async afterInit() {
    console.log('status gateway init');
  }

  /**
   * @brief handleConnection
   *
   * @description
   * connection event handler
   * 로그인시 유저의 상태정보를 업데이트한다.
   */
  @SubscribeMessage('connect')
  @UseGuards(AccessTokenGuard)
  async handleConnection(@ConnectedSocket() client: any) {
    console.log('status gateway connection');
    if (client.handshake.auth.server) {
      console.log('consumer connected');
      return;
    }
    if (!client.handshake.auth.token) {
      return;
    }
    const sub = this.statusService.getSub(client.handshake.auth.token);
    if (sub == null) {
      return;
    }
    this.statusProducer.login(sub, client.id, client.handshake.auth.token);
  }

  /**
   * @brief handleStatusSync
   *
   * @param message: online인 친구목록
   */
  @SubscribeMessage('change-status')
  async handleStatusSync(
    @ConnectedSocket() client: any,
    @MessageBody() body: string,
  ) {
    console.log('status gateway change-status');
    const friends: GetFriendResponseDto[] = JSON.parse(body);
    if (friends.length == 0) {
      return false;
    }
    for (const friend of friends) {
      //온라인 친구에게 로그인/로그아웃한 유저의 상태정보를 전송한다.
      this.server
        .to(friend.friend.statusSocketId)
        .emit('change-status', friend.user);
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: any) {
    console.log('status gateway disconnect');
    const sub = this.statusService.getSub(client.handshake.auth.token);
    if (!sub) return;
    this.statusProducer.logout(sub, client.id, client.handshake.auth.token);
  }

  /** [친구요청 프로세스]
   * client: socket.emit으로 시작.
   * */
  @SubscribeMessage('request-friend')
  handleRequestFriend(
    @ConnectedSocket() client: any,
    @MessageBody() body: string,
  ) {
    console.log('friend-request');
    const requestUser = this.statusService.getSub(client.handshake.auth.token);
    if (!requestUser) return;
    const requestFriendDto: FriendRequestJobData = {
      userId: requestUser,
      clientId: client.id,
      bearerToken: client.handshake.auth.token,
      friendRequestBody: JSON.parse(body),
    };
    this.statusProducer.requestFriend(requestFriendDto);
  }

  @SubscribeMessage('send-request-friend-to-user')
  handleSendRequestFriend(
    @ConnectedSocket() client: any,
    @MessageBody() body: string,
  ) {
    console.log('send-request-friend-to-user');
    const requestUser = this.statusService.getSub(client.handshake.auth.token);
    if (!requestUser) return;
    this.statusProducer.sendRequestFriendToUser(
      requestUser,
      client.id,
      client.handshake.auth.token,
    );
  }

  @SubscribeMessage('accept-friend')
  handleAcceptFriend(
    @ConnectedSocket() client: any,
    @MessageBody() body: string,
  ) {
    console.log('accept friend');
    const requestUser = this.statusService.getSub(client.handshake.auth.token);
    if (!requestUser) return;
    this.statusProducer.acceptFriend(
      requestUser,
      client.id,
      client.handshake.auth.token,
    );
  }
}
