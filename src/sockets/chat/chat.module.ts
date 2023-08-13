import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppConfigModule } from 'src/config/app.config';
import { WsAccessTokenGuard } from '../guards/WsAccessTokenGuard.guard';
import { ChatGateway } from './chat.gateway';
import { ChatGatewayService } from './chat.gateway.service';

@Module({
  imports: [JwtModule, AppConfigModule],
  providers: [ChatGateway, JwtService, WsAccessTokenGuard, ChatGatewayService],
})
export class ChatModule {}
