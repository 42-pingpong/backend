import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { createCookieExtractor } from './tokenExtractor';

interface accTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        createCookieExtractor('accessToken'),
      ]),
      secretOrKey: configService.get('jwt.access_secret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: accTokenPayload) {
    console.log('payload:', payload);
    console.log(Date.now() / 1000, payload.exp);
    return payload;
  }
}
