import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { CreateGameScoreRequestDto } from './request/create-game-score.dto';
import { CreateGameDto } from './request/create-game.dto';

@Injectable()
export class GameGatewayService {
  private readonly restApiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.restApiUrl = configService.get('url.restApiUrl');
  }

  getSub(auth: string): number {
    if (auth == undefined) return null;
    auth = auth.split(' ')[1];
    const payload = this.jwtService.decode(auth);
    if (payload == null) {
      return null;
    } else return payload.sub;
  }

  // get은 header에 token을 넣어서 보내야함, 또 json을 보내지 않아서 Content-Type을 설정하지 않아도 됨
  async getNickName(userId: number, bearerToken: string): Promise<string> {
    const response = await axios.get(`${this.restApiUrl}/user/nick/${userId}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return await response.data;
  }

  async setGame(bearerToken: string, gameinfo: CreateGameDto) {
    const res = await axios.post(`${this.restApiUrl}/game`, gameinfo, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    // gameInfo 반환
    return res.data;
  }

  async setHistory(bearerToken: string, history: CreateGameScoreRequestDto) {
    await axios.post(`${this.restApiUrl}/game/score`, history, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
    });
  }

  async login(userId: number, clientId: string, bearerToken: string) {
    try {
      await axios.patch(
        `${this.restApiUrl}/user/${userId}`,
        {
          status: 'online',
          gameSocketId: clientId,
        },
        {
          headers: {
            Authorization: bearerToken,
          },
        },
      );
    } catch (error) {}
  }

  // get은 header에 token을 넣어서 보내야함, 또 json을 보내지 않아서 Content-Type을 설정하지 않아도 됨
  async getGameSocketId(userId: number, bearerToken: string): Promise<string> {
    const response = await axios.get(`${this.restApiUrl}/socketId/${userId}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    return await response.data;
  }
}
