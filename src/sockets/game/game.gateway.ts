import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

const waitList = [];

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    console.log('Init');
  }

  @SubscribeMessage('connect')
  handleConnection(client: any, ...args: any[]) {
    console.log('Connection');
  }

  @SubscribeMessage('login')
  handleLogin(client: any, payload: any) {
    if (waitList.includes(client)) {
      waitList.splice(waitList.indexOf(client), 1);
      return;
    }

    waitList.push(client);

    if (waitList.length === 2) {
      const roomName = waitList[0].id + '/' + waitList[1].id;
      // client.join(roomName);
      // waitList[0].join(roomName);
      // waitList[1].join(roomName);
      waitList[0].emit('join', roomName);
      waitList[1].emit('join', roomName);
      waitList[0].emit('player-number', 1);
      waitList[1].emit('player-number', 2);
      waitList.splice(0, 2);
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: any) {
    console.log('Disconnect');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
