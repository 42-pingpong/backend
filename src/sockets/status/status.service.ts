import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StatusService {
  constructor(private readonly jwtService: JwtService) {}

  getSub(auth: string): number {
    const bearer = auth.substring(7);
    const payload = this.jwtService.decode(bearer);
    return payload.sub;
  }
}
