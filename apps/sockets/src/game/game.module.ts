import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GameGatewayService } from './game.gateway.servcie';
import { AppConfigModule } from '@app/common/config/app.config';

@Module({
  imports: [JwtModule, AppConfigModule],
  providers: [GameGateway, JwtService, GameGatewayService],
})
export class GameModule {}
