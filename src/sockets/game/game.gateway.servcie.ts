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

  async getNickName(userId: number): Promise<string> {
    const response = await axios.get(`${this.restApiUrl}/user/nick/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('id, res.data', userId, response.data);
    return response.data;
  }
}
