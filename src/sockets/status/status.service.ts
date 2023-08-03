import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StatusService {
  constructor(private readonly jwtService: JwtService) {}

  getSub(auth: string): number {
    if (auth == undefined) return null;
    const bearer = auth.substring(6);
    console.log('bearer: ', bearer);
    const payload = this.jwtService.decode(bearer);
    console.log('payload: ', payload);
    if (payload == null) {
      return null;
    } else return payload.sub;
  }
}
