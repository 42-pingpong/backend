import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCookieExtractor } from './tokenExtractor';
import { ITokenPayload } from 'src/interface/IUser.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/entities/auth/token.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth.service';
import { ITokens } from 'src/interface/ITokens.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {
    super({
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
  async validate(req: Request, payload: ITokenPayload) {
    console.log(payload);
    const refreshToken = req.cookies['refreshToken'];
    const accessToken = req.cookies['accessToken'];
    /**
     * 1. check the issuer
     * cookie (acc, refresh) <--> database(acc, refresh)
     * */
    const databaseTok = await this.tokenRepository.findOne({
      where: { ownerId: parseInt(payload.sub) },
    });
    if (
      !databaseTok ||
      accessToken !== databaseTok.accessToken ||
      databaseTok.refreshToken !== refreshToken
    ) {
      throw new UnauthorizedException();
    } else {
      //update
      const tokens: ITokens = await this.authService.issueTokens(
        databaseTok.ownerId,
      );
      return tokens;
    }
  }
}
