import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { StatusService } from './status.service';
import { Socket } from 'net';

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
  constructor(private readonly statusService: StatusService) {}

  afterInit(server: any) {
    console.log('status gateway init');
  }

  @SubscribeMessage('login')
  handleConnection(client: Socket) {
    console.log('status gateway connection');
    console.log('client :', client);
    return 'hello';
  }

  @SubscribeMessage('logout')
  handleDisconnect(client: Socket) {
    console.log('status gateway disconnect');
    return 'hello';
  }
}
