import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCookieExtractor } from './tokenExtractor';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        createCookieExtractor('refreshToken'),
      ]),
      secretOrKey: configService.get('jwt.refresh_secret'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    console.log(req.cookies);
    const refreshToken = req.cookies['refreshToken'];
    return { ...payload, refreshToken };
  }
}
