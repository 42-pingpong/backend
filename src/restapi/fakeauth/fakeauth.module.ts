import { Module } from '@nestjs/common';
import { FakeauthController } from './fakeauth.controller';
import { AppConfigModule } from 'src/config/app.config';
import { PassportModule } from '@nestjs/passport';
import { appDatabase } from 'src/datasource/appdatabase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.entity';
import { Token } from 'src/entities/auth/token.entity';
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
