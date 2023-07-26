import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ITokenPayload } from 'src/interface/IUser.types';
import { createCookieExtractor } from './tokenExtractor';

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

  /**
   * check only expiration in access token
   * 자원접근 제한을 위한 strategy
   * */
  async validate(payload: ITokenPayload): Promise<ITokenPayload> {
    console.log('payload:', payload);
    console.log(Date.now() / 1000, payload.exp);
    return payload;
  }
}
