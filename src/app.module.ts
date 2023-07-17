import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from './status/status.module';
import { RestapiModule } from './restapi/restapi.module';
import { User } from './entities/user/user.entity';
import { GroupChat } from './entities/chat/groupChat.entity';
import { GroupChatMessage } from './entities/chat/groupChatMessage.entity';
import { MessageInfo } from './entities/chat/messageInfo.entity';
import { FriendRequest } from './entities/user/friendRequest.entity';
import { DirectMessage } from './entities/chat/directMessage.entity';
import { BlockUserList } from './entities/user/blockUserList.entity';
import { GameInfo } from './entities/game/gameInfo.entity';
import { GameScore } from './entities/game/gameScore.entity';
import { GameInvitation } from './entities/game/gameInvitation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      //development일때는 .env파일을 무시하고 환경변수를 사용한다.
      ignoreEnvFile: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        User,
        GroupChat,
        GroupChatMessage,
        MessageInfo,
        FriendRequest,
        DirectMessage,
        BlockUserList,
        GameInfo,
        GameScore,
        GameInvitation,
      ],
      synchronize: true, //for development
      dropSchema: true, //for development
    }),
    ChatModule,
    GameModule,
    StatusModule,
    RestapiModule,
  ],
})
export class AppModule {}
