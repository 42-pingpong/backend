import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [ChatGateway, GameGateway],
})
export class AppModule {}
