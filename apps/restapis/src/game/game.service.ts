import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameInfo } from '@app/common/entities/gameInfo.entity';
import { GameScore } from '@app/common/entities/gameScore.entity';
import { User } from '@app/common/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateGameScoreRequestDto } from './request/create-game-score.dto';
import { CreateGameDto } from './request/create-game.dto';
import { CreateGameScoreResponseDto } from './response/create-game-score.dto';

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

  async createScore(
    createGameDto: CreateGameScoreRequestDto,
  ): Promise<CreateGameScoreResponseDto> {
    return await this.gameScoreRepository.manager.transaction(
      async (manager: EntityManager) => {
        // 유저가 존재하는지 확인
        const user = await manager.getRepository(User).findOne({
          where: {
            id: createGameDto.userId,
          },
        });

        if (!user) {
          throw new NotFoundException('유저가 존재하지 않습니다.');
        }

        // 게임이 존재하는지 확인
        const gameInfo = await manager.getRepository(GameInfo).findOne({
          where: {
            gameId: createGameDto.gameId,
          },
        });
        if (!gameInfo) {
          throw new NotFoundException('게임이 존재하지 않습니다.');
        }

        // 게임 점수를 생성합니다.
        const res = await manager
          .getRepository(GameScore)
          .insert(createGameDto);

        // 게임 점수를 가져옵니다.
        return await manager.getRepository(GameScore).findOne({
          where: {
            id: res.identifiers[0].id,
          },
        });
      },
    );
  }

  async getHistory(userId: number) {
    return await this.gameScoreRepository.manager.transaction(
      async (manager: EntityManager) => {
        const user = await manager.getRepository(User).findOne({
          where: {
            id: userId,
          },
        });

        if (!user) {
          throw new NotFoundException('유저가 존재하지 않습니다.');
        }

        const subQuery = manager
          .createQueryBuilder(GameScore, 'GameScore2') // Use the defined alias for the subquery
          .select('GameScore2.gameId') // Use the alias in the select
          .where(`GameScore2.userId = ${userId}`); // Use the alias for the condition

        const qb = manager
          .createQueryBuilder(GameInfo, 'gameInfo')
          .innerJoinAndSelect('gameInfo.gameScores', 'gameScore')
          .innerJoinAndSelect('gameScore.user', 'user')
          .select('gameInfo.gameId')
          .addSelect('gameInfo.createDate')
          .addSelect('gameInfo.gameMap')
          .addSelect('gameScore.score')
          .addSelect('user.id')
          .addSelect('user.nickName')
          .addSelect('user.profile')
          .where(`gameInfo.gameId IN (${subQuery.getQuery()})`);
        return await qb.getMany();
      },
    );
  }
}
