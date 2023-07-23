import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  //need auth guard
  @ApiOperation({ summary: '42 login' })
  @UseGuards(AuthGuard('42'))
  @Get('42/login')
  async login42() {
    return null;
  }

  @UseGuards(AuthGuard('42'))
  @Get('42/redirect')
  async redirect42(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rtn = await this.authService.login(req.user);
    res.cookie('accessToken', rtn.accessToken, {
      //this expires is checked by browser
      expires: new Date(Date.now() + 1000 * 30),
    });
    res.cookie('refreshToken', rtn.refreshToken, {
      httpOnly: true,
      //this expires is checked by browser
      expires: new Date(Date.now() + 1000 * 60),
    });
    res.redirect('http://localhost:3000/login');
  }

  @ApiOperation({ summary: 'refresh token end point' })
  @UseGuards(AuthGuard('jwt-refresh')) //access token strategy는 AuthGuard('jwt')로 대체
  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(res);
  }
}
