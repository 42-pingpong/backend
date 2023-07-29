import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FTAuthGuard } from './Guards/ft.guard';
import { RefreshTokenGuard } from './Guards/refreshToken.guard';
import { AccessTokenGuard } from './Guards/accessToken.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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
    res.cookie('accessToken', rtn.accessToken, {
      //this expires is checked by browser
      expires: new Date(Date.now() + 1000 * 60 * 60),
    });
    res.cookie('refreshToken', rtn.refreshToken, {
      httpOnly: true,
      //this expires is checked by browser
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });
    res.redirect(
      `${this.configService.get('url').frontHost}:${
        this.configService.get('url').frontPort
      }/`,
    );
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
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        //this expires is checked by browser
        expires: new Date(Date.now() + 1000 * 60 * 60),
      });
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        //this expires is checked by browser
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      });
      res.redirect(
        `${this.configService.get('url').frontHost}:${
          this.configService.get('url').frontPort
        }/`,
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
}
