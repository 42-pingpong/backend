import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { appDatabase } from '@app/common/datasource/appdatabase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupChat } from '@app/common/entities/groupChat.entity';
import { AppConfigModule } from '@app/common/config/app.config';
import { GroupChatMessage } from '@app/common/entities/groupChatMessage.entity';
import { MessageInfo } from '@app/common/entities/messageInfo.entity';
import { BlockUserList } from '@app/common/entities/blockUserList.entity';
import { MutedUserJoin } from '@app/common/entities/mutedUserJoin.entity';

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
