import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { GameGatewayService } from './game.gateway.servcie';

@Module({
  imports: [JwtModule],
  providers: [GameGateway, JwtService, GameGatewayService],
})
export class GameModule {}
