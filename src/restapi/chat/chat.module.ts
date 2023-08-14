import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { appDatabase } from 'src/datasource/appdatabase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { AppConfigModule } from 'src/config/app.config';
import { GroupChatMessage } from 'src/entities/chat/groupChatMessage.entity';
import { MessageInfo } from 'src/entities/chat/messageInfo.entity';
import { BlockUserList } from 'src/entities/user/blockUserList.entity';
import { MutedUserJoin } from '../../entities/chat/mutedUserJoin.entity';

@Module({
  imports: [
    AppConfigModule,
    appDatabase,
    TypeOrmModule.forFeature([
      GroupChat,
      GroupChatMessage,
      MessageInfo,
      BlockUserList,
      MutedUserJoin,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
