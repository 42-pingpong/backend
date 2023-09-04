import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/common/entities/user.entity';
import { appDatabase } from '@app/common/datasource/appdatabase';
import { Token } from '@app/common/entities/token.entity';
import { AppConfigModule } from '@app/common/config/app.config';
import { FriendsWith } from '@app/common/entities/friendsWith.entity';
import { Request } from '@app/common/entities/request.entity';
import { AccessTokenGuard } from '@app/common/guards/accessToken.guard';

@Module({
  imports: [
    AppConfigModule,
    appDatabase,
    TypeOrmModule.forFeature([User, Token, FriendsWith, Request]),
  ],
  controllers: [UserController],
  providers: [UserService, AccessTokenGuard],
})
export class UserModule {}
