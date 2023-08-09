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
const playerIdList: number[] = [0, 0];
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
    console.log('Game Connection');
  }

  @SubscribeMessage('enter-queue')
  handleLogin(client: Socket, id: number) {
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
      playerList[0].emit('player-number', 1);
      playerList[1].emit('player-number', 2);
      // 여기서 player1, player2의 id를 순서 맞춰서 잘 넣어줘야함
    }
  }

  // @SubscribeMessage('player1-id')
  // handlePlayer1Id(client: any, id: number) {
  //   console.log('player1-id', id);
  //   playerIdList[0] = id;
  // }

  // @SubscribeMessage('player2-id')
  // handlePlayer2Id(client: any, id: number) {
  //   console.log('player2-id', id);
  //   playerIdList[1] = id;
  // }

  @SubscribeMessage('join')
  async handleJoin(client: any, id: number) {
    console.log('제발요bbb');
    console.log(playerIdList[0]);
    console.log(playerIdList[1]);

    const player1NickName = await this.gameGatewayService.getNickName(
      playerIdList[0],
    );
    const player2NickName = await this.gameGatewayService.getNickName(
      playerIdList[1],
    );
    console.log('????');

    console.log('player1NickName: ', player1NickName);
    console.log('player2NickName: ', player2NickName);

    playerList[0].emit('user-name', player1NickName, player2NickName);
    playerList[1].emit('user-name', player2NickName, player1NickName);

    playerList.slice(0, 2);
    readyState.push(client);
  }

  @SubscribeMessage('ready')
  handleReady(client: any) {
    if (readyState.includes(client)) {
      readyState.splice(readyState.indexOf(client), 1);
      return;
    }

    readyState.push(client);

    if (readyState.length === 2) {
      readyState[0].emit('ready', true);
      readyState[1].emit('ready', true);
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: any) {
    console.log('Disconnect 할 때 leave 해야 할      듯');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('w')
  handleWMove(client: any, payload: any) {
    client.broadcast.emit('w-move');
  }

  @SubscribeMessage('s')
  handleSMove(client: any, payload: any) {
    client.broadcast.emit('s-move');
  }

  @SubscribeMessage('down')
  handleDownMove(client: any, payload: any) {
    client.broadcast.emit('down-move');
  }

  @SubscribeMessage('up')
  handleUpMove(client: any, payload: any) {
    client.broadcast.emit('up-move');
  }
}
