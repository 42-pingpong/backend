import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FourtyTwoStrategy } from './Oauth/42-strategy';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.entity';
import { ConfigService } from '@nestjs/config';
import { Token } from 'src/entities/auth/token.entity';
import { AccessTokenGuard } from './Guards/accessToken.guard';
import { RefreshTokenGuard } from './Guards/refreshToken.guard';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenStrategy } from './token/access-token.strategy';
import { RefreshTokenStrategy } from './token/refresh-token.strategy';
import { appDatabase } from 'src/datasource/appdatabase';
import { FTAuthGuard } from './Guards/ft.guard';
import { AppConfigModule } from 'src/config/app.config';
import { FriendsWith } from 'src/entities/user/friendsWith.entity';

@Module({
  imports: [
    AppConfigModule,
    PassportModule.register({}),
    appDatabase,
    TypeOrmModule.forFeature([User, Token, FriendsWith]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    JwtService,
    AccessTokenStrategy,
    AccessTokenGuard,
    RefreshTokenStrategy,
    RefreshTokenGuard,
    FourtyTwoStrategy,
    FTAuthGuard,
  ],
})
export class AuthModule {}
