import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { AppConfigModule } from 'src/config/app.config';
import { appDatabase } from 'src/datasource/appdatabase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameInfo } from 'src/entities/game/gameInfo.entity';
import { GameScore } from 'src/entities/game/gameScore.entity';
import { AccessTokenGuard } from '../auth/Guards/accessToken.guard';

@Module({
  imports: [
    AppConfigModule,
    appDatabase,
    TypeOrmModule.forFeature([GameInfo, GameScore]),
  ],
  controllers: [GameController],
  providers: [GameService, AccessTokenGuard],
})
export class GameModule {}
