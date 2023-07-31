import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { appDatabase } from 'src/datasource/appdatabase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { AppConfigModule } from 'src/config/app.config';

@Module({
  imports: [
    AppConfigModule,
    appDatabase,
    TypeOrmModule.forFeature([GroupChat]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
