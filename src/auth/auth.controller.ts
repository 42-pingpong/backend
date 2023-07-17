import { Controller, Post, Body, Query, UseGuards } from '@nestjs/common';
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
    @Query() query: any,
  ) {
    console.log(req.user);
    //@Todo
    //req.user에는 42에서 받아온 정보가 들어있다.
    //이 정보를 이용하여
    //1. database에서 해당 유저가 있는지 확인
    //2. 없으면 db에 저장하고 아래 단계 진행.
    //
    //있으면
    //1. token 발급(jwt strategy)
    //2. token을 cookie에 저장
    //3. redirection
    res.redirect(req.headers.host);
  }
}
