import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameGatewayService } from './game.gateway.servcie';
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

  // game socket 연결시 실행
  @SubscribeMessage('connect')
  handleConnection(client: any, ...args: any[]) {
    console.log('Game Socket Connection');
  }

  // game 버튼 클릭시 실행
  @SubscribeMessage('enter-queue')
  async handleLogin(client: Socket, id: number) {
    // 게임을 찾다가 게임찾기 취소
    if (waitList.length && waitList[0].socket === client) {
      const idx = waitList.findIndex((player) => player.socket === client);
      if (idx !== -1) {
        waitList.splice(idx, 1);
        return;
      }
    }

    // 대기열에 넣기
    // if (waitList.length === 1) {
    //   return;
    // }
    // waitList.push({
    //   socket: client,
    //   id: id,
    //   token: client.handshake.auth.token,
    // });

    if (waitList.length === 0) {
      waitList.push({
        socket: client,
        id: id,
        token: client.handshake.auth.token,
        is_host: true,
      });
      return;
    }

    waitList.push({
      socket: client,
      id: id,
      token: client.handshake.auth.token,
      is_host: false,
    });

    // 대기열에 2명이 모이면 방을 만듬
    if (waitList.length === 2) {
      const gameInfo: CreateGameDto = {};
      // host의 token을 setGame으로 넘김
      const game = await this.gameGatewayService.setGame(
        waitList[0].token,
        gameInfo,
      );

      // waitList[0].roomId = game.gameId;
      // waitList[0].play_number = 1;
      // waitList[0].enemy_id = waitList[1].id;
      // waitList[1].roomId = game.gameId;
      // waitList[1].play_number = 2;
      // waitList[1].enemy_id = waitList[0].id;

      waitList.forEach((player, index) => {
        player.roomId = game.gameId;
        player.play_number = index + 1;
        player.enemy_id = waitList[1 - index].id;
      });

      // 방에 입장
      await waitList[0].socket.join(game.gameId.toString());
      await waitList[0].socket.join(game.gameId.toString());
      await waitList[1].socket.join(game.gameId.toString());

      // 플레이어 목록에 추가
      playerList.push(waitList[0]);
      playerList.push(waitList[1]);

      // 대기열에서 제거
      waitList.splice(0, 2);
    }

    const idx = playerList.findIndex((player) => player.socket === client);
    const enemyIdx = playerList.findIndex(
      (player) => player.id === playerList[idx].enemy_id,
    );

    // console.log('idx', idx);
    // console.log('enemyIdx', enemyIdx);
    if (idx === -1 || enemyIdx === -1) {
      console.log('idx === -1 || enemyIdx === -1');
      return;
    }
    // 플레이어 목록에 있는 플레이어들에게 방 입장을 알림
    playerList[enemyIdx].socket.emit('join', playerList[enemyIdx].roomId);
    playerList[idx].socket.emit('join', playerList[enemyIdx].roomId);

    // 플레이어들에게 플레이어 번호를 알림
    playerList[enemyIdx].socket.emit('player-number', 1);
    playerList[idx].socket.emit('player-number', 2);
  }

  // 방에 입장시 실행
  @SubscribeMessage('join')
  async handleJoin(client: any) {
    console.log('방 입장~~~');
    const idx = playerList.findIndex((player) => player.socket === client);
    const enemyIdx = playerList.findIndex(
      (player) => player.id === playerList[idx].enemy_id,
    );
    if (idx === -1 || enemyIdx === -1) {
      console.log('idx === -1 || enemyIdx === -1');
      return;
    }

    // 플레이어의 닉네임을 가져옴
    if (playerList[idx].is_host) {
      const player1NickName = await this.gameGatewayService.getNickName(
        playerList[idx].id,
        playerList[idx].token,
      );
      const player2NickName = await this.gameGatewayService.getNickName(
        playerList[enemyIdx].id,
        playerList[enemyIdx].token,
      );

      // 플레이어들에게 닉네임을 알림
      playerList[idx].socket.emit(
        'user-name',
        player1NickName,
        player2NickName,
      );
      playerList[enemyIdx].socket.emit(
        'user-name',
        player1NickName,
        player2NickName,
      );
    }
  }

  // 게임 시작 전에 Ready 버튼 클릭시 실행
  @SubscribeMessage('ready')
  handleReady(client: any) {
    console.log('게임 레디~~~');
    // readyState에 클라이언트가 존재하면 return
    if (readyState.includes(client)) return;

    readyState.push(client);

    const idx = playerList.findIndex((player) => player.socket === client);
    const enemyIdx = playerList.findIndex(
      (player) => player.id === playerList[idx].enemy_id,
    );
    if (idx === -1 || enemyIdx === -1) {
      console.log('idx === -1 || enemyIdx === -1');
      return;
    }

    // 서버에게 ready상태 알림
    this.server.to(playerList[0].roomId.toString()).emit('ready', true);

    if (readyState.length === 2) {
      readyState[idx].emit('start', true);
      readyState[enemyIdx].emit('start', true);
    }
  }

  // 게임 종료시 실행
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
    const idx = playerList.findIndex((player) => player.socket === client);
    if (client === playerList[idx].socket)
      this.server.to(playerList[idx].roomId.toString()).emit('move', payload);
  }

  @SubscribeMessage('ballX-set')
  handleBallXSet(client: Socket, ballX: number) {
    const idx = playerList.findIndex((player) => player.socket === client);
    if (client === playerList[idx].socket)
      this.server.to(playerList[idx].roomId.toString()).emit('ballX', ballX);
  }

  @SubscribeMessage('ballY-set')
  handleBallYSet(client: Socket, ballY: number) {
    const idx = playerList.findIndex((player) => player.socket === client);
    if (client === playerList[idx].socket)
      this.server.to(playerList[idx].roomId.toString()).emit('ballY', ballY);
  }

  @SubscribeMessage('player1Score-set')
  handlePlayer1ScoreSet(client: Socket, player1Score: number) {
    const idx = playerList.findIndex((player) => player.socket === client);
    console.log('player1Score-set', player1Score);
    if (client === playerList[idx].socket)
      this.server
        .to(playerList[idx].roomId.toString())
        .emit('player1Score', player1Score);
  }

  @SubscribeMessage('player2Score-set')
  handlePlayer2ScoreSet(client: Socket, player2Score: number) {
    const idx = playerList.findIndex((player) => player.socket === client);
    console.log('player2Score-set', player2Score);
    if (client === playerList[idx].socket)
      this.server
        .to(playerList[idx].roomId.toString())
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
    console.log('게임 끝~~~');
    console.log('payload', payload);
    if (!client.id) return;
    const idx = playerList.findIndex((player) => player.socket === client);
    if (idx === -1) return;
    if (client.id === playerList[idx].socket.id) {
      await this.gameGatewayService.setHistory(playerList[idx].token, payload);
      if (playerList[idx])
        await client.leave(playerList[idx].roomId.toString());
      playerList.splice(idx, 1);
      readyState.splice(idx, 1);
    }
  }

  // @SubscribeMessage('room-out')
  // async handleRoomOut(client: Socket) {
  //   const idx = playerList.findIndex((player) => player.socket === client);
  //   if (idx === -1) return;
  // }
}
