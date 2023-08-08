import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppConfigModule } from 'src/config/app.config';
import { AccessTokenGuard } from 'src/restapi/auth/Guards/accessToken.guard';
import { AccessTokenStrategy } from 'src/restapi/auth/token/access-token.strategy';
import { ChatGateway } from './chat.gateway';
import { ChatGatewayService } from './chat.gateway.service';

@Module({
  imports: [JwtModule, AppConfigModule],
  providers: [
    ChatGateway,
    JwtService,
    AccessTokenStrategy,
    AccessTokenGuard,
    ChatGatewayService,
  ],
})
export class ChatModule {}
