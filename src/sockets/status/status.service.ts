import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StatusService {
  constructor(private readonly jwtService: JwtService) {}

  getSub(auth: string): number {
    const bearer = auth.substring(7);
    console.log('bearer: ', bearer);
    const payload = this.jwtService.decode(bearer);
    console.log('payload: ', payload);
    return payload.sub;
  }
}
