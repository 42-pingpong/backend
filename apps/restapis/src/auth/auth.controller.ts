import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FTAuthGuard } from '@app/common/guards/ft.guard';
import { RefreshTokenGuard } from '@app/common/guards/refreshToken.guard';
import { AccessTokenGuard } from '@app/common/guards/accessToken.guard';
import { MailService } from '../mail/mail.service';
import { MailTokenGuard } from '@app/common/guards/mail-fa.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  //need auth guard
  @ApiOperation({
    summary: '42 login',
    description: '42 login버튼에 달아주세요',
  })
  @UseGuards(FTAuthGuard)
  @Get('42/login')
  async login42() {
    return null;
  }

  @ApiOperation({
    summary: '42 redirect',
    description: '42 login 후 redirect url에서 처리. 직접사용금지',
  })
  @UseGuards(FTAuthGuard)
  @Get('42/redirect')
  async redirect42(@Req() req: Request, @Res() res: Response) {
    const rtn = await this.authService.login(req.user);

    if (rtn.is2FAEnabled && !rtn.is2FAVerified) {
      const faToken = await this.mailService.send2faMailAndGet2faToken({
        userId: rtn.id,
        nickName: rtn.nickName,
        mailAddress: rtn.email,
      });

      res.redirect(
        `${this.configService.get('url').frontHost}:${
          this.configService.get('url').frontPort
        }/2fa?tmp=${faToken}`,
      );
    } else {
      const tokens = await this.authService.issueTokens(rtn.id);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        //this expires is checked by browser
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      res.redirect(
        `${this.configService.get('url').frontHost}:${
          this.configService.get('url').frontPort
        }/token?accessToken=${tokens.accessToken}`,
      );
    }
  }

  @ApiOperation({
    summary: 'refresh token end point',
    description:
      'refresh, access token이 cookie에 있는 상태로 요청시, cookie의 acc, ref token을 재발급합니다.',
  })
  @ApiUnauthorizedResponse({
    description: 'redirect to 42 login page',
  })
  @UseGuards(RefreshTokenGuard) //access token strategy는 AuthGuard('jwt')로 대체
  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    try {
      const tokens = await this.authService.refreshTokens(req.user);
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        //this expires is checked by browser
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      res.redirect(
        `${this.configService.get('url').frontHost}:${
          this.configService.get('url').frontPort
        }/token?accessToken=${tokens.accessToken}`,
      );
    } catch (e) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.sendStatus(401);
    }
  }

  @ApiOperation({
    summary: 'logout',
    description: '로그아웃',
  })
  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.logout(+req.user.sub);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.sendStatus(200);
  }

  @ApiOperation({
    summary: '2FA verify',
    description: '2FA verify',
  })
  @UseGuards(MailTokenGuard)
  @Get('/login/:code/2fa')
  async verify2FA(@Param('code') code: string, @Req() req: Request) {
    const user = await this.mailService.verify(+req.user.sub, +code);
    const tokens = await this.authService.issueTokens(user.id);
    console.log(tokens);
    return {
      accessToken: tokens.accessToken,
    };
  }
}
