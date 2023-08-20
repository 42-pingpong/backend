import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { AppConfigModule } from '@app/common/config/app.config';
import { appDatabase } from '@app/common/datasource/appdatabase';
import { GameInfo } from '@app/common/entities/gameInfo.entity';
import { GameScore } from '@app/common/entities/gameScore.entity';
import { AccessTokenGuard } from '@app/common/guards/accessToken.guard';
import { TypeOrmModule } from '@nestjs/typeorm';

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
