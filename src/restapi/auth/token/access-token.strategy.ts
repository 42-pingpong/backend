import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.access_secret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('payload:', payload);
    console.log(Date.now() / 1000, payload.exp);
    return payload;
  }
}
