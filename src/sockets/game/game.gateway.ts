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
import { CreateGameScoreRequestDto } from 'src/restapi/game/request/create-game-score.dto';
import { PlayerInfo } from './PlayerInfo';

const waitList: PlayerInfo[] = [];
const playerList: PlayerInfo[] = [];
const playerIdList: number[] = [null, null];
const readyState = [];
enum playerNumber {
  PLAYER1,
  PLAYER2,
}

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
    // 이미 대기열에 있는지 확인
    if (waitList.length && waitList[0].socket === client) {
      return;
    }

    // 대기열에 넣음
    waitList.push({
      socket: client,
      id: id,
      token: client.handshake.auth.token,
    });

    // 대기열에 2명이 모이면 방을 만듬
    if (waitList.length === 2) {
      const roomName = waitList[0].socket.id + '/' + waitList[1].socket.id;
      waitList[0].roomId = roomName;
      waitList[0].number = playerNumber.PLAYER1;
      waitList[1].roomId = roomName;
      waitList[1].number = playerNumber.PLAYER2;

      // 방에 입장
      await waitList[0].socket.join(roomName);
      await waitList[1].socket.join(roomName);

      // 대기열에서 제거, 플레이어 목록에 추가
      playerList.push(waitList[0]);
      playerList.push(waitList[1]);

      // 플레이어 목록에 있는 플레이어들에게 방 입장을 알림
      playerList[0].socket.emit('join', roomName);
      playerList[1].socket.emit('join', roomName);

      // 대기열에서 제거
      waitList.splice(0, 2);

      // 플레이어들에게 플레이어 번호를 알림
      playerList[0].socket.emit('player-number', 0);
      playerList[1].socket.emit('player-number', 1);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(client: any) {
    // 플레이어의 닉네임을 가져옴
    const player1NickName = await this.gameGatewayService.getNickName(
      playerList[0].id,
      playerList[0].token,
    );
    const player2NickName = await this.gameGatewayService.getNickName(
      playerList[1].id,
      playerList[1].token,
    );

    // 플레이어들에게 닉네임을 알림
    playerList[0].socket.emit('user-name', player1NickName, player2NickName);
    playerList[1].socket.emit('user-name', player1NickName, player2NickName);

    // readyState에 클라이언트를 추가
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

  @SubscribeMessage('move')
  handlePaddleMovement(client: Socket, payload: string) {
    console.log('back', payload);
    this.server.to(playerList[0].roomId).emit('move', payload);
  }

  @SubscribeMessage('ballX-set')
  handleBallXSet(client: Socket, ballX: any, xSpeed?: number) {
    this.server.to(playerList[0].roomId).emit('ballX', ballX, xSpeed);
  }

  @SubscribeMessage('ballY-set')
  handleBallYSet(client: Socket, ballY: any, ySpeed?: number) {
    this.server.to(playerList[0].roomId).emit('ballY', ballY, ySpeed);
  }

  @SubscribeMessage('end')
  async handleEnd(client: Socket, payload: CreateGameScoreRequestDto) {
    await this.gameGatewayService.setHistory(playerList[0].token, payload);
    await this.gameGatewayService.setHistory(playerList[1].token, payload);

    console.log(payload.gameId);
    console.log(payload.score);
    console.log(payload.userId);

    client.leave(playerList[0].roomId);
    client.leave(playerList[1].roomId);
    readyState.splice(0, 2);
    playerIdList.splice(0, 2);
    playerList.splice(0, 2);
    waitList.splice(0, 2);
  }
}
