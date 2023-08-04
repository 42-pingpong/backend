import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.entity';
import { appDatabase } from 'src/datasource/appdatabase';
import { Token } from 'src/entities/auth/token.entity';
import { AppConfigModule } from 'src/config/app.config';
import { FriendsWith } from 'src/entities/user/friendsWith.entity';
import { Request } from 'src/entities/user/request.entity';

@Module({
  imports: [
    AppConfigModule,
    appDatabase,
    TypeOrmModule.forFeature([User, Token, FriendsWith, Request]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
