import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FourtyTwoStrategy } from '@app/common/strategy/42-strategy';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from '@app/common/guards/accessToken.guard';
import { RefreshTokenGuard } from '@app/common/guards/refreshToken.guard';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenStrategy } from '@app/common/strategy/access-token.strategy';
import { RefreshTokenStrategy } from '@app/common/strategy/refresh-token.strategy';
import { FTAuthGuard } from '@app/common/guards/ft.guard';
import { User } from '@app/common/entities/user.entity';
import { Token } from '@app/common/entities/token.entity';
import { appDatabase } from '@app/common/datasource/appdatabase';
import { AppConfigModule } from '@app/common/config/app.config';
import { FriendsWith } from '@app/common/entities/friendsWith.entity';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    AppConfigModule,
    PassportModule.register({}),
    appDatabase,
    TypeOrmModule.forFeature([User, Token, FriendsWith]),
    MailModule,
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
    MailService,
  ],
})
export class AuthModule {}
