import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameInfo } from 'src/entities/game/gameInfo.entity';
import { GameScore } from 'src/entities/game/gameScore.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateGameDto } from './request/create-game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameInfo)
    private readonly gameInfoRepository: Repository<GameInfo>,

    @InjectRepository(GameScore)
    private readonly gameScoreRepository: Repository<GameScore>,
  ) {}

  async createGame(createGameDto: CreateGameDto) {
    return await this.gameInfoRepository.manager.transaction(
      async (manager: EntityManager) => {
        const newGameInfo = await manager
          .getRepository(GameInfo)
          .insert(createGameDto);

        const newGameInfoId = newGameInfo.identifiers[0].gameId;
        return await manager.getRepository(GameInfo).findOne({
          where: { gameId: newGameInfoId },
          select: {
            gameId: true,
            gameMap: true,
            createDate: true,
          },
        });
      },
    );
  }

  async createHistory(createGameDto: CreateGameDto) {
    return 'This action adds a new game';
  }

  async getHistory(userId: number) {}
}
