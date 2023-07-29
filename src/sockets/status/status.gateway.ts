import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'net';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/restapi/auth/Guards/accessToken.guard';
import { StatusProducer } from './status.producer';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJobData } from 'src/interface/user.jobdata';
import { StatusService } from './status.service';

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

  private readonly redisClient: Redis;

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
    const sub = this.statusService.getSub(client.handshake.auth.token);
    if (sub == null) {
      return;
    }
    this.statusProducer.login(sub, client.id, client.handshake.auth.token);
  }

  @SubscribeMessage('get-friend-status')
  async handleStatusSync(@ConnectedSocket() client: any, payload: any) {
    console.log('status gateway sync');
    console.log(client.id);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: any) {
    const sub = this.statusService.getSub(client.handshake.auth.token);
    if (!sub) return;
    this.statusProducer.logout(sub, client.id, client.handshake.auth.token);
  }
}
