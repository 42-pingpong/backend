import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

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
  @UseGuards(AuthGuard('42'))
  @Get('42/login')
  async login42() {
    return null;
  }

  @ApiOperation({
    summary: '42 redirect',
    description: '42 login 후 redirect url에서 처리. 직접사용금지',
  })
  @UseGuards(AuthGuard('42'))
  @Get('42/redirect')
  async redirect42(@Req() req: Request, @Res() res: Response) {
    const rtn = await this.authService.login(req.user);
    res.cookie('accessToken', rtn.accessToken, {
      httpOnly: true,
      //this expires is checked by browser
      expires: new Date(Date.now() + 1000 * 30),
    });
    res.cookie('refreshToken', rtn.refreshToken, {
      httpOnly: true,
      //this expires is checked by browser
      expires: new Date(Date.now() + 1000 * 60),
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
  @UseGuards(AuthGuard('jwt-refresh')) //access token strategy는 AuthGuard('jwt')로 대체
  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    res.cookie('accessToken', req.user.accessToken, {
      httpOnly: true,
      //this expires is checked by browser
      expires: new Date(Date.now() + 1000 * 30),
    });
    res.cookie('refreshToken', req.user.refreshToken, {
      httpOnly: true,
      //this expires is checked by browser
      expires: new Date(Date.now() + 1000 * 60),
    });
    res.redirect(
      `${this.configService.get('url').frontHost}:${
        this.configService.get('url').frontPort
      }/`,
    );
  }
}
