import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

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
}
