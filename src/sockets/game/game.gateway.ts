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
    console.log('Game Connection');
  }

  @SubscribeMessage('enter-queue')
  handleLogin(client: Socket, id: number) {
    if (waitList.length && waitList[0].socket === client) {
      return;
    }

    waitList.push({ socket: client, id: id });
    console.log(waitList.length);

    if (waitList.length === 2) {
      console.log('length 2');
      const roomName = waitList[0].id + '/' + waitList[1].id;

      // client.join(roomName);
      waitList[0].socket.join(roomName);
      waitList[1].socket.join(roomName);

      // const player1Info = { socket: waitList[0], id: id }; // new
      // const player2Info = { socket: waitList[1], id: id }; // new

      // playerList.push(player1Info, player2Info); // new

      playerList.push(waitList[0]);
      playerList.push(waitList[1]);

      console.log('emit join');
      playerList[0].socket.emit('join', roomName);
      playerList[1].socket.emit('join', roomName);
      console.log('emit join end');

      waitList.splice(0, 2);

      playerList[0].socket.emit('player-number', 1);
      playerList[1].socket.emit('player-number', 2);

      // console.log('player1Info.id', player1Info.id);
      // console.log('player2Info.id', player2Info.id);
      console.log('client.id', client.id);

      // playerList[0].id === client.id
      //   ? (playerIdList[0] = id)
      //   : (playerIdList[1] = id);
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
    console.log('playerIdList[0]', playerIdList[0]);
    console.log('playerIdList[1]', playerIdList[1]);

    const player1Info = playerList[0];
    const player2Info = playerList[1];

    const player1NickName = await this.gameGatewayService.getNickName(
      player1Info.id,
    );
    const player2NickName = await this.gameGatewayService.getNickName(
      player2Info.id,
    );
    console.log('????');

    console.log('player1NickName: ', player1NickName);
    console.log('player2NickName: ', player2NickName);

    player1Info.socket.emit('user-name', player1NickName, player2NickName);
    player2Info.socket.emit('user-name', player2NickName, player1NickName);

    // playerList.slice(0, 2);
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
