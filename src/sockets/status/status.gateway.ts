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
import { Redis } from 'ioredis';
import { ApiTags } from '@nestjs/swagger';
import { StatusService } from './status.service';
import { GetFriendResponseDto } from 'src/restapi/user/dto/get-friend-response.dto';

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
    @MessageBody() message: string,
  ) {
    console.log('status gateway change-status');
    console.log(client.id);
    const data: GetFriendResponseDto[] = JSON.parse(message);
    for (const user of data) {
      //온라인 친구에게 로그인/로그아웃한 유저의 상태정보를 전송한다.
      this.server
        .to(user.friend.statusSocketId)
        .emit('change-status', user.user);
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: any) {
    console.log('status gateway disconnect');
    const sub = this.statusService.getSub(client.handshake.auth.token);
    if (!sub) return;
    this.statusProducer.logout(sub, client.id, client.handshake.auth.token);
  }
}
