import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppConfigModule } from '@app/common/config/app.config';
import { ChatGateway } from './chat.gateway';
import { ChatGatewayService } from './chat.gateway.service';

@Module({
  imports: [JwtModule, AppConfigModule],
  providers: [ChatGateway, JwtService, ChatGatewayService],
})
export class ChatModule {}
