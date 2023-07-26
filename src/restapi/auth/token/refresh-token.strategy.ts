import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCookieExtractor } from './tokenExtractor';
import { IJwtPayload } from 'src/interface/IUser.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      //refresh token을 추출.
      jwtFromRequest: ExtractJwt.fromExtractors([
        createCookieExtractor('refreshToken'),
      ]),
      secretOrKey: configService.get('jwt.refresh_secret'),
      passReqToCallback: true,
    });
  }

  /**
   * the expiration checked above strategy.
   * check refresh token is valid.
   * user가 1개의 refresh token만 가진다고 가정.
   * */
  async validate(req: Request, payload: any): Promise<IJwtPayload> {
    const refreshToken = req.cookies['refreshToken'];
    const accessToken = req.cookies['accessToken'];
    return {
      refreshToken,
      accessToken,
      ...payload,
    };
  }
}
