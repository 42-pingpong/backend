import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ITokenPayload } from '@app/common/interface/IUser.types';

@Injectable()
export class MailTokenStrategy extends PassportStrategy(Strategy, 'mail') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.mail_secret'),
      ignoreExpiration: false,
    });
  }

  /**
   * check only expiration in access token
   * 자원접근 제한을 위한 strategy
   * */
  async validate(payload: ITokenPayload): Promise<ITokenPayload> {
    return payload;
  }
}
