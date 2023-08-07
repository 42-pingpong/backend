import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateFakeUserDto } from './dto/create-fake-user.dto';

@ApiTags('fakeauth')
@Controller('fakeauth')
export class FakeauthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    description: 'Fake login for development and testing',
    summary: 'Fake login for development and testing',
  })
  @Get('login')
  async login(
    @Query() fakeUserDto: CreateFakeUserDto,
    @Res() res: Response,
  ): Promise<any> {
    const createUserDto = new CreateUserDto();
    createUserDto.id = fakeUserDto.id;

    createUserDto.fullName = 'Fake User';
    createUserDto.level = 1;
    createUserDto.nickName = 'Fake User' + fakeUserDto.id;
    createUserDto.profile =
      'https://devs.lol/uploads/2021/12/meme-dev-humor-when-you-are-a-typescript-developer-263.jpg';
    createUserDto.email = 'test@email.com' + fakeUserDto.id;
    createUserDto.selfIntroduction = 'Fake User';

    const tokens = await this.authService.login(createUserDto);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    res.redirect(
      `${this.configService.get('url').frontHost}:${
        this.configService.get('url').frontPort
      }/token?accessToken=${tokens.accessToken}`,
    );
  }
}
