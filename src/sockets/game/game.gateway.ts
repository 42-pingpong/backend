import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameGatewayService } from './game.gateway.servcie';
import { Socket } from 'socket.io';

const waitList: Socket[] = [];
const playerList: Socket[] = [];
const readyState = [];

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

  constructor(private readonly gameGatewayService: GameGatewayService) {}

  afterInit(server: any) {
    console.log('Init');
  }

  @SubscribeMessage('connect')
  handleConnection(client: any, ...args: any[]) {
    console.log('Connection');
  }

  @SubscribeMessage('enter-queue')
  handleLogin(client: Socket, payload: any) {
    if (waitList.includes(client)) {
      waitList.splice(waitList.indexOf(client), 1);
      return;
    }

    waitList.push(client);
    console.log(waitList.length);

    if (waitList.length === 2) {
      console.log('length 2');
      const roomName = waitList[0].id + '/' + waitList[1].id;

      // client.join(roomName);
      waitList[0].join(roomName);
      waitList[1].join(roomName);
      playerList.push(waitList[0]);
      playerList.push(waitList[1]);
      console.log('emit join');
      playerList[0].emit('join', roomName);
      playerList[1].emit('join', roomName);
      console.log('emit join end');
      waitList.splice(0, 2);
    }
    playerList[0].emit('player-number', 1);
    playerList[1].emit('player-number', 2);
  }

  @SubscribeMessage('join')
  async handleJoin(client: any, id: number) {
    const userNickName = await this.gameGatewayService.getNickName(id);
    console.log('userNickName', userNickName);

    playerList[0].emit('user-name', userNickName, 'nickName2');
    playerList[1].emit('user-name', 'nickName2', 'nickName1');

    readyState.push(client);
  }

  @SubscribeMessage('start')
  handleStart(client: any) {
    if (readyState.includes(client)) {
      readyState.splice(readyState.indexOf(client), 1);
      return;
    }

    readyState.push(client);

    if (readyState.length === 2) {
      readyState[0].emit('start');
      readyState[1].emit('start');
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: any) {
    console.log('Disconnect 할 때 leave 해야 할 듯');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
