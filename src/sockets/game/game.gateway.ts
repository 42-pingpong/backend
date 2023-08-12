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
import { CreateGameDto } from 'src/restapi/game/request/create-game.dto';

const waitList: PlayerInfo[] = [];
const playerList: PlayerInfo[] = [];
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
      const gameInfo: CreateGameDto = {
        // gameMap: 'map1',
        // gameId: roomName,
      };
      const game = await this.gameGatewayService.setGame(
        waitList[0].token,
        gameInfo,
      );

      const roomName = game.gameId;

      waitList[0].roomId = roomName;
      waitList[0].number = 1;
      waitList[1].roomId = roomName;
      waitList[1].number = 2;

      // 방에 입장
      await waitList[0].socket.join(roomName.toString());
      await waitList[1].socket.join(roomName.toString());

      // 대기열에서 제거, 플레이어 목록에 추가
      playerList.push(waitList[0]);
      playerList.push(waitList[1]);

      // 플레이어 목록에 있는 플레이어들에게 방 입장을 알림
      playerList[0].socket.emit('join', roomName);
      playerList[1].socket.emit('join', roomName);

      // 대기열에서 제거
      waitList.splice(0, 2);

      // 플레이어들에게 플레이어 번호를 알림
      playerList[0].socket.emit('player-number', 1);
      playerList[1].socket.emit('player-number', 2);
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

    this.server.to(playerList[0].roomId.toString()).emit('ready', true);

    if (readyState.length === 2) {
      readyState[0].emit('start', true);
      readyState[1].emit('start', true);
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
    this.server.to(playerList[0].roomId.toString()).emit('move', payload);
  }

  @SubscribeMessage('ballX-set')
  handleBallXSet(client: Socket, ballX: number) {
    if (client === playerList[0].socket)
      this.server.to(playerList[0].roomId.toString()).emit('ballX', ballX);
  }
  /////////////
  @SubscribeMessage('ballY-set')
  handleBallYSet(client: Socket, ballY: number) {
    if (client === playerList[0].socket)
      this.server.to(playerList[0].roomId.toString()).emit('ballY', ballY);
  }

  @SubscribeMessage('player1Score-set')
  handlePlayer1ScoreSet(client: Socket, player1Score: number) {
    if (client === playerList[0].socket)
      this.server
        .to(playerList[0].roomId.toString())
        .emit('player1Score', player1Score);
  }

  @SubscribeMessage('player2Score-set')
  handlePlayer2ScoreSet(client: Socket, player2Score: number) {
    if (client === playerList[0].socket)
      this.server
        .to(playerList[0].roomId.toString())
        .emit('player2Score', player2Score);
  }

  // @SubscribeMessage('room-out')
  // async handleRoomOut(client: Socket, payload: CreateGameScoreRequestDto) {
  //   // 방의 안나간 플레이어 정보 저장
  //   const playersInRoom = playerList.filter(
  //     (player) => player.roomId === payload.gameId.toString(),
  //   );

  //   const leaver = playerList.find()

  //   if (playersInRoom.length == 1) {
  //     // 남아있는 플레이어 winner 결정
  //     const winner = playersInRoom[0];

  //     winner.socket.emit('end', { winner: true });

  //     // 게임 종료 후 데이터를 초기화하거나 저장
  //     await this.gameGatewayService.setHistory(winner.token, payload);

  //     // 방 삭제
  //     client.leave(payload.gameId.toString());
  //   }
  // }

  @SubscribeMessage('end')
  async handleEnd(client: Socket, payload: CreateGameScoreRequestDto) {
    console.log('payload', payload);
    if (!client.id) return;
    if (client.id === playerList[0].socket.id) {
      await this.gameGatewayService.setHistory(playerList[0].token, payload);
    } else {
      await this.gameGatewayService.setHistory(playerList[1].token, payload);

      // console.log(payload.gameId);
      // console.log(payload.score);
      // console.log(payload.userId);

      // 모든 플레이어를 방에서 나가도록 함
      await client.leave(playerList[0].roomId.toString());
      // client.leave(playerList[1].roomId);

      playerList.splice(0, 2);
      readyState.splice(0, 2);
    }
  }
}
