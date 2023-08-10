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

interface PlayerInfo {
  socket: Socket; // 이 Socket은 실제 사용되는 Socket 타입에 맞게 수정해야 함
  id: number;
  token: string;
}

const waitList: PlayerInfo[] = [];
// const playerList: Socket[] = [];
const playerList: PlayerInfo[] = [];
const playerIdList: number[] = [null, null];
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
    console.log('Game Socket Connection');
  }

  @SubscribeMessage('enter-queue')
  async handleLogin(client: Socket, id: number) {
    if (waitList.length && waitList[0].socket === client) {
      return;
    }

    waitList.push({
      socket: client,
      id: id,
      token: client.handshake.auth.token,
    });
    console.log(waitList.length);

    if (waitList.length === 2) {
      console.log('waitList.length 2');
      const roomName = waitList[0].id + '/' + waitList[1].id;

      await waitList[0].socket.join(roomName);
      await waitList[1].socket.join(roomName);

      playerList.push(waitList[0]);
      playerList.push(waitList[1]);

      console.log('emit join');
      playerList[0].socket.emit('join', roomName);
      playerList[1].socket.emit('join', roomName);
      console.log('emit join end');

      waitList.splice(0, 2);

      playerList[0].socket.emit('player-number', 1);
      playerList[1].socket.emit('player-number', 2);
    }
  }
  @SubscribeMessage('join')
  async handleJoin(client: any, id: number) {
    const player1Info = playerList[0];
    const player2Info = playerList[1];

    const player1NickName = await this.gameGatewayService.getNickName(
      player1Info.id,
      player1Info.token,
    );
    const player2NickName = await this.gameGatewayService.getNickName(
      player2Info.id,
      player2Info.token,
    );

    player1Info.socket.emit('user-name', player1NickName, player2NickName);
    player2Info.socket.emit('user-name', player1NickName, player2NickName);

    // playerList.slice(0, 2);
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
