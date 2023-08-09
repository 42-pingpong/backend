import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GameGatewayService {
  constructor(private readonly jwtService: JwtService) {}

  async getNickName(nick: string): Promise<string> {
    const payload = this.jwtService.decode(nick);
    return payload['nickName'];
  }
}
