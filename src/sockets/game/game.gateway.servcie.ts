import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GameGatewayService {
  constructor(private readonly jwtService: JwtService) {}

  async getNickname(): Promise<string> {
    return 'nickname';
  }
}
