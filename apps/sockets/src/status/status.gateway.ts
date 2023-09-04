import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { StatusService } from './status.service';
import { GetFriendResponse } from './restapiResponse/get-friend.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestAcceptDto } from './dto/request-accept.dto';
import { RequestRejectDto } from './dto/request-reject.dto';
import { RequestFriendDto } from './dto/request-friend.dto';

export interface ChangeStatusData {
  friendList: GetFriendResponse[];
  me: CreateUserDto;
}

/**
 * @brief status gateway
 *
 * @description 유저 상태정보를 관리하는 gateway
 */
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
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: any;

  constructor(private readonly statusService: StatusService) {}

  /**
   * @brief handleConnection
   *
   * @description
   * connection event handler
   * 로그인시 유저의 상태정보를 업데이트한다.
   */
  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: any) {
    // console.log(client.handshake.auth.token);
    const sub = this.statusService.getSub(client.handshake.auth.token);
    // console.log('sub: ??', sub);
    if (sub == null) {
      return;
    }
    const changeStatusData: ChangeStatusData = await this.statusService.login(
      sub,
      client.id,
      client.handshake.auth.token,
    );

    if (changeStatusData?.friendList) {
      for (const friend of changeStatusData.friendList) {
        // 온라인 친구에게 로그인/로그아웃한 유저의 상태정보를 전송한다.
        this.server
          .to(friend.statusSocketId)
          .emit('change-status', changeStatusData.me);
      }
    }

    //send all alarms
    const alarms = await this.statusService.getAlarms(
      sub,
      client.handshake.auth.token,
    );
    this.server.to(client.id).emit('alarms', alarms);
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
    const requestUser = this.statusService.getSub(client.handshake.auth.token);
    if (!requestUser) return;
    const requestFriendJobData: RequestFriendDto = {
      userId: requestUser,
      clientId: client.id,
      bearerToken: client.handshake.auth.token,
      friendRequestBody: JSON.parse(body),
    };
    const rtn = await this.statusService.postRequestFriend(
      requestFriendJobData,
    );
    if (rtn?.requestedUser?.status === 'online') {
      const socketId = rtn.requestedUser.statusSocketId;
      delete rtn.requestedUser;
      this.server.to(socketId).emit('request-friend-from-user', rtn);
    }
  }

  @SubscribeMessage('checked-alarm')
  handleSendRequestFriend(
    @ConnectedSocket() client: any,
    @MessageBody() body: string,
  ) {
    const requestUser = this.statusService.getSub(client.handshake.auth.token);
    if (!requestUser) return;
    this.statusService.checkAlarm(
      requestUser,
      client.id,
      client.handshake.auth.token,
    );
  }

  @SubscribeMessage('accept-friend')
  async handleAcceptFriend(
    @ConnectedSocket() client: any,
    @MessageBody() body: RequestAcceptDto,
  ) {
    const requestedUserId = this.statusService.getSub(
      client.handshake.auth.token,
    );
    if (!requestedUserId) return;
    const [requester, requestedUser] = await this.statusService.acceptFriend(
      client.handshake.auth.token,
      body,
    );
    this.server
      .to(requester.statusSocketId)
      .emit('accept-friend', requestedUser);
    this.server
      .to(requestedUser.statusSocketId)
      .emit('accept-friend', requester);
  }

  @SubscribeMessage('reject-friend')
  handleRejectFriend(
    @ConnectedSocket() client: any,
    @MessageBody() body: RequestRejectDto,
  ) {
    const requestedUser = this.statusService.getSub(
      client.handshake.auth.token,
    );
    if (!requestedUser) return;
    this.statusService.rejectFriend(client.handshake.auth.token, body);
  }
}
