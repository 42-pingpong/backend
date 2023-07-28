import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { StatusModule } from './status/status.module';
import { RestapiModule } from './restapi/restapi.module';
import { appDatabase } from './datasource/appdatabase';
import { AppConfigModule } from './config/app.config';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    AppConfigModule,
    appDatabase,
    ChatModule,
    GameModule,
    StatusModule,
    RestapiModule,
    QueueModule,
  ],
})
export class AppModule {}
