import { Module } from '@nestjs/common';
import { FakeauthController } from './fakeauth.controller';
import { AppConfigModule } from '@app/common/config/app.config';
import { appDatabase } from '@app/common/datasource/appdatabase';
import { User } from '@app/common/entities/user.entity';
import { Token } from '@app/common/entities/token.entity';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    AppConfigModule,
    PassportModule,
    appDatabase,
    TypeOrmModule.forFeature([User, Token]),
  ],
  controllers: [FakeauthController],
  providers: [JwtService, AuthService],
})
export class FakeauthModule {}
