import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  //need auth guard
  @Get('42/login')
  @UseGuards(AuthGuard('42'))
  async login42() {
    return null;
  }

  @Get('42/redirect')
  @UseGuards(AuthGuard('42'))
  async redirect42(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('profile:', req.user);
    if (!req.user) {
      res.statusCode = 401;
      res.send('Authorization failed');
    } else {
      res.statusCode = 200;
      // database에서 req.user.id를 이용해서 유저정보를 가져와.
      // const dbUser = await this.authService.findUser(req.user.id);

      // if (dbUser) {
      //dbUser의 정보를 가지고 jwt token을 만들어서 발급
      // }
      // else {
      //   //db에 req.user (최초 로그인한 유저) 정보를 저장하고
      //   jwt 토큰을 발급한다.
      // }

      res.send('ttt');
    }
  }
}
