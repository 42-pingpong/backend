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
import { ApiTags } from '@nestjs/swagger';
import { StatusService } from './status.service';
import { FriendRequestJobData } from 'src/interface/user.jobdata';
import { GetFriendResponse } from 'src/restapi/user/response/get-friend.response';
import { CreateUserDto } from 'src/restapi/user/dto/create-user.dto';

export interface ChangeStatusData {
  friendList: GetFriendResponse[];
  me: CreateUserDto;
}

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

  constructor(private readonly statusService: StatusService) {}

  async afterInit() {}

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
    const sub = this.statusService.getSub(client.handshake.auth.token);
    if (sub == null) {
      return;
    }
    const changeStatusData: ChangeStatusData = await this.statusService.login(
      sub,
      client.id,
      client.handshake.auth.token,
    );

    if (
      changeStatusData === undefined ||
      !changeStatusData.friendList ||
      !changeStatusData.me
    ) {
      return false;
    }

    if (changeStatusData.friendList.length == 0) {
      return false;
    }

    for (const friend of changeStatusData.friendList) {
      // 온라인 친구에게 로그인/로그아웃한 유저의 상태정보를 전송한다.
      this.server
        .to(friend.statusSocketId)
        .emit('change-status', changeStatusData.me);
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(client: any) {
    const sub = this.statusService.getSub(client.handshake.auth.token);
    if (!sub) return;
    const changeStatusData: ChangeStatusData =
      await this.statusService.disconnect(
        sub,
        client.id,
        client.handshake.auth.token,
      );
    if (
      changeStatusData === undefined ||
      !changeStatusData.friendList ||
      !changeStatusData.me
    ) {
      return false;
    }

    if (changeStatusData.friendList.length == 0) {
      return false;
    }

    for (const friend of changeStatusData.friendList) {
      // 온라인 친구에게 로그인/로그아웃한 유저의 상태정보를 전송한다.
      this.server
        .to(friend.statusSocketId)
        .emit('change-status', changeStatusData.me);
    }
  }

  /** [친구요청 프로세스]
   * client: socket.emit으로 시작.
   * */
  @SubscribeMessage('request-friend')
  async handleRequestFriend(
    @ConnectedSocket() client: any,
    @MessageBody() body: string,
  ) {
    console.log('friend-request');
    const requestUser = this.statusService.getSub(client.handshake.auth.token);
    if (!requestUser) return;
    const requestFriendJobData: FriendRequestJobData = {
      userId: requestUser,
      clientId: client.id,
      bearerToken: client.handshake.auth.token,
      friendRequestBody: JSON.parse(body),
    };
    const rtn = await this.statusService.postRequestFriend(
      requestFriendJobData,
    );
    if (rtn && rtn.requestedUser.status === 'online') {
      const socketId = rtn.requestedUser.statusSocketId;
      delete rtn.requestedUser;
      this.server.to(socketId).emit('request-friend-from-user', rtn);
    }
  }

  @SubscribeMessage('send-request-friend-to-user')
  handleSendRequestFriend(
    @ConnectedSocket() client: any,
    @MessageBody() body: string,
  ) {
    console.log('send-request-friend-to-user');
    const requestUser = this.statusService.getSub(client.handshake.auth.token);
    if (!requestUser) return;
    this.statusService.sendRequestFriendToUser(
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
    this.statusService.acceptFriend(
      requestUser,
      client.id,
      client.handshake.auth.token,
    );
  }
}
