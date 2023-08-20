import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [StatusModule, ChatModule, GameModule],
})
export class SocketModule {}
