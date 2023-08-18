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
import e from 'express';

const waitList: PlayerInfo[] = [];
const playerList: PlayerInfo[] = [];

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
  async handleConnection(client: any, ...args: any[]) {
    const sub = this.gameGatewayService.getSub(client.handshake.auth.token);
    if (sub == null) {
      console.log('sub == null');
      return;
    }
    // status online으로 변경하고 socketId 저장
    await this.gameGatewayService.login(
      sub,
      client.id,
      client.handshake.auth.token,
    );
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

      waitList.forEach((player, index) => {
        player.roomId = game.gameId;
        player.play_number = index + 1;
        player.enemy_id = waitList[1 - index].id;
      });

      // 방에 입장
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
      console.log('player1NickName', player1NickName);
      console.log('player2NickName', player2NickName);
    }
  }

  // 게임 시작 전에 Ready 버튼 클릭시 실행
  @SubscribeMessage('ready')
  handleReady(client: any) {
    console.log('게임 레디~~~');
    const idx = playerList.findIndex((player) => player.socket === client);
    const enemyIdx = playerList.findIndex(
      (player) => player.id === playerList[idx].enemy_id,
    );
    if (idx === -1 || enemyIdx === -1) {
      console.log('idx === -1 || enemyIdx === -1');
      return;
    }
    // readyState에 클라이언트가 존재하면 return (매칭 -> 취소)
    // if (readyState.includes(client)) return;
    if (playerList[idx].ready_status) return;

    playerList[idx].ready_status = true;
    // readyState.push(client);

    // 서버에게 ready상태 알림
    this.server.to(playerList[0].roomId.toString()).emit('ready', true);

    if (playerList[idx].ready_status && playerList[enemyIdx].ready_status) {
      console.log('게임 시작~~~');
      playerList[idx].socket.emit('start', true);
      playerList[enemyIdx].socket.emit('start', true);
      // playerList.splice(Math.max(idx, enemyIdx), 1);
      // playerList.splice(Math.min(idx, enemyIdx), 1);
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
    if (!client.id) {
      console.log('!client.id');
      return;
    }
    const idx = playerList.findIndex((player) => player.socket === client);
    const enemyIdx = playerList.findIndex(
      (player) => player.id === playerList[idx].enemy_id,
    );
    if (idx === -1 || enemyIdx === -1) {
      console.log('idx === -1 || enemyIdx === -1');
      return;
    }

    const getRoomId = playerList[idx].roomId.toString();
    console.log(getRoomId);

    await this.gameGatewayService.setHistory(playerList[idx].token, payload);
    await client.leave(getRoomId);
    if (playerList.length === 0) return;
    if (playerList[idx].is_host) {
      playerList.splice(Math.max(idx, enemyIdx), 1);
      playerList.splice(Math.min(idx, enemyIdx), 1);
    }
  }

  @SubscribeMessage('room-out')
  async handleRoomOut(client: Socket, payload: CreateGameScoreRequestDto) {
    console.log('hihi');
    const idx = playerList.findIndex((player) => player.socket === client);
    const enemyIdx = playerList.findIndex(
      (player) => player.id === playerList[idx].enemy_id,
    );
    console.log('런~~~', playerList[idx].id);

    if (idx === -1 || enemyIdx === -1) {
      console.log('idx === -1 || enemyIdx === -1');
      return;
    }

    client.emit('room-out');
    playerList[enemyIdx].socket.emit('end-room-out', { winner: true });

    // await this.gameGatewayService.setHistory(playerList[idx].token, payload);
    // await client.leave(playerList[idx].roomId.toString());

    // playerList.splice(Math.max(idx, enemyIdx), 1);
    // playerList.splice(Math.min(idx, enemyIdx), 1);

    // if (readyState.includes(playerList[idx].socket))
    //   readyState.splice(Math.max(idx, enemyIdx), 1);
    // if (readyState.includes(playerList[enemyIdx].socket))
    //   readyState.splice(Math.min(idx, enemyIdx), 1);
    console.log('idx', idx);
    console.log('enemyIdx', enemyIdx);
    if (playerList.length === 0) {
      console.log('playerList.length === 0');
      return;
    }
  }
  /**
   *
   * @param client 소켓
   * @param id 나
   * @param targetId 상대방 Id
   * @description
   * - go-pingpong 을 보낸 클라이언트만 들어옵니다
   *
   * - 나의 id와 상대방의 id를 받아서
   * - 상대방의 socketId를 가져와서
   * - 상대방에게 invite 이벤트를 emit
   *
   * - 상대방은 invite 이벤트를 받고(emit할때 내 게임소켓 아이디 보내야 함) 응답을 서버로 보냄
   * - yes면 go-pingpong 이벤트를 emit
   * - 아니면 뭐 ... 유감
   */
  @SubscribeMessage('invite-pingpong')
  async handleInvitePingpong(client: Socket, id: number, targetId: number) {
    {
      // id: 나, targetID: 상대방
      // targetId로 유저 정보 가져와서 GameSocketId 로 invite event emit(게임 초대 받았음)
      const targetSocketId = await this.gameGatewayService.getGameSocketId(
        targetId,
        client.handshake.auth.token,
      );
      if (targetSocketId) {
        client.to(targetSocketId).emit('go-pingpong');
      }
    }
  }
  /**
   *
   * @param client
   * @param id info 채우라고 들고왔어여
   * @param isHost 호스트인지 아닌지 (초대 한 애가 보내게 할게요)
   * @description
   * - 이 이벤트에는 두 명 다 들어옵니다
   *
   * - 들어온 경우: 초대를 잘 받았고, 수락했음
   * - PlayerInfo 두 개 만들고, 초대 먼저 보냈던 친구만 isHost true로 보낼게요
   * - set game , info 마저 채우기, room에 join, playerNumber(host1) emit
   *
   * - 하면 플레이어쪽에서 게임 페이지로 보내면서 join으로 쏘옥
   */
  @SubscribeMessage('go-pingpong')
  async handleGoPingpongEnter(client: Socket, dto: PlayerInfo) {
    console.log('dto', dto);
    playerList.push({
      socket: client,
      id: dto.id,
      token: client.handshake.auth.token,
      is_host: dto.is_host,
      play_number: dto.play_number,
      enemy_id: dto.enemy_id,
    });
    const idx = playerList.findIndex((player) => player.socket === client);
    if (playerList.length % 2 === 0) {
      const enemyIdx = playerList.findIndex(
        (player) => player.id === playerList[idx].enemy_id,
      );
      console.log('idx', idx);
      console.log('enemyIdx', enemyIdx);

      if (idx === -1 || enemyIdx === -1) {
        console.log('idx === -1 || enemyIdx === -1');
        return;
      }
      const gameInfo: CreateGameDto = {};
      const game = await this.gameGatewayService.setGame(
        playerList[idx].token,
        gameInfo,
      );

      playerList[idx].roomId = game.gameId;
      playerList[enemyIdx].roomId = game.gameId;

      await playerList[idx].socket.join(game.gameId.toString());
      await playerList[enemyIdx].socket.join(game.gameId.toString());

      playerList[idx].socket.emit('join', playerList[idx].roomId);
      playerList[enemyIdx].socket.emit('join', playerList[idx].roomId);

      playerList[idx].socket.emit('player-number', 1);
      playerList[enemyIdx].socket.emit('player-number', 2);
    }
  }

  // @SubscribeMessage('go-pingpong-setup')
  // async handleGoPingpongSetup(client: Socket, id: number) {
  //   const idx = playerList.findIndex((player) => player.socket === client);
  //   if ((playerList.length %= 2)) {
  //     const enemyIdx = playerList.findIndex(
  //       (player) => player.id === playerList[idx].enemy_id,
  //     );
  //     if (idx === -1 || enemyIdx === -1) {
  //       console.log('idx === -1 || enemyIdx === -1');
  //       return;
  //     }
  //     const gameInfo: CreateGameDto = {};
  //     const game = await this.gameGatewayService.setGame(
  //       playerList[idx].token,
  //       gameInfo,
  //     );

  //     playerList[idx].roomId = game.gameId;
  //     playerList[enemyIdx].roomId = game.gameId;

  //     await playerList[idx].socket.join(game.gameId.toString());
  //     await playerList[enemyIdx].socket.join(game.gameId.toString());

  //     playerList[idx].socket.emit('join', playerList[idx].roomId);
  //     playerList[enemyIdx].socket.emit('join', playerList[idx].roomId);

  //     playerList[idx].socket.emit('player-number', 1);
  //     playerList[enemyIdx].socket.emit('player-number', 2);
  //   }
  // }

  // @SubscribeMessage('go-pingpong-join')
  // async handleGoPingpongJoin(client: Socket, id: number) {
  //   const idx = playerList.findIndex((player) => player.socket === client);
  //   const enemyIdx = playerList.findIndex(
  //     (player) => player.id === playerList[idx].enemy_id,
  //   );
  //   if (idx === -1 || enemyIdx === -1) {
  //     console.log('idx === -1 || enemyIdx === -1');
  //     return;
  //   }

  //   // 플레이어의 닉네임을 가져옴
  //   if (playerList[idx].is_host) {
  //     const player1NickName = await this.gameGatewayService.getNickName(
  //       playerList[idx].id,
  //       playerList[idx].token,
  //     );
  //     const player2NickName = await this.gameGatewayService.getNickName(
  //       playerList[enemyIdx].id,
  //       playerList[enemyIdx].token,
  //     );

  //     // 플레이어들에게 닉네임을 알림
  //     playerList[idx].socket.emit(
  //       'user-name',
  //       player1NickName,
  //       player2NickName,
  //     );
  //     playerList[enemyIdx].socket.emit(
  //       'user-name',
  //       player1NickName,
  //       player2NickName,
  //     );
  //     console.log('player1NickName', player1NickName);
  //     console.log('player2NickName', player2NickName);
  //   }
  // }

  // @SubscribeMessage('go-pingpong-ready')
  // handleGoPingpongReady(client: Socket, id: number) {
  //   const idx = playerList.findIndex((player) => player.socket === client);
  //   const enemyIdx = playerList.findIndex(
  //     (player) => player.id === playerList[idx].enemy_id,
  //   );
  //   if (idx === -1 || enemyIdx === -1) {
  //     console.log('idx === -1 || enemyIdx === -1');
  //     return;
  //   }

  //   if (playerList[idx].ready_status) return;

  //   playerList[idx].ready_status = true;

  //   this.server.to(playerList[idx].roomId.toString()).emit('ready', true);

  //   if (playerList[idx].ready_status && playerList[enemyIdx].ready_status) {
  //     console.log('게임 시작~~~');
  //     playerList[idx].socket.emit('start', true);
  //     playerList[enemyIdx].socket.emit('start', true);
  //   }
  // }

  // @SubscribeMessage('go-pingpong-start')
  // async handleGoPingpongStart(client: Socket, id: number) {}
}
