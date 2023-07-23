import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { StatusModule } from './status/status.module';
import { RestapiModule } from './restapi/restapi.module';
import { appDatabase } from './datasource/appdatabase';
import { ConfigModule } from '@nestjs/config';
import database from './config/database';
import auth from './config/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [database, auth],
    }),
    appDatabase,
    ChatModule,
    GameModule,
    StatusModule,
    RestapiModule,
  ],
})
export class AppModule {}
