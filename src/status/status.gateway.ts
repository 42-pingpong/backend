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
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { ApiOperation } from '@nestjs/swagger';

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
export class StatusGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: any;

  private readonly redisClient: Redis;

  constructor(
    private readonly statusProducer: StatusProducer,
    private readonly jwtService: JwtService,
  ) {
    this.redisClient = new Redis({
      host: 'redis',
      port: 6379,
    });
  }

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
  @ApiOperation({
    summary: 'connect',
    description: '유저의 상태정보를 업데이트한다.',
  })
  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: any, payload: any) {
    console.log('status gateway connection');
    const sid = decodeURIComponent(
      client.handshake.headers.cookie.split(';')[0].split('=')[1],
    )
      .substring(2)
      .split('.')[0];
    const user = await this.redisClient.get('sess:' + sid);
    const userObj = JSON.parse(user);
    this.statusProducer.login(
      userObj.user,
      client.id,
      client.handshake.auth.token,
    );
  }

  @SubscribeMessage('get-friend-status')
  async handleStatusSync(@ConnectedSocket() client: any, payload: any) {
    console.log('status gateway sync');
    console.log(client.id);
    const sid = decodeURIComponent(
      client.handshake.headers.cookie.split(';')[0].split('=')[1],
    );
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: Socket) {
    console.log('status gateway disconnect');
    return 'hello';
  }
}
