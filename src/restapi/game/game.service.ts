import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameInfo } from 'src/entities/game/gameInfo.entity';
import { GameScore } from 'src/entities/game/gameScore.entity';
import { User } from 'src/entities/user/user.entity';
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

        //userId가 플레이한 게임의 정보를 가져온다.
        //게임은 gameInfo와 여러개의 GameScore로 이루어져있다.
        //gameInfo는 게임의 기본 정보를 담고있고, GameScore는 게임의 점수와 유저를 담고있다.
        //gameInfo와 GameScore는 1:N 관계이다.
        //gameInfo와 GameScore를 조인하고, GameScore의 user를 조인한다.
        //user는 게임을 플레이한 유저이다.
        //join했을때 UserId가 1개라도 속한 join된 GameInfo를 가져온다.

        const subQueryAlias = 'gameScore2'; // Define the subquery alias

        const subQuery = manager
          .createQueryBuilder(GameScore, subQueryAlias) // Use the defined alias for the subquery
          .select(`${subQueryAlias}.gameId`) // Use the alias in the select
          .from(GameScore, subQueryAlias) // Use the alias for the table reference
          .where(`${subQueryAlias}.userId = ${userId}`); // Use the alias for the condition

        const qb = manager
          .createQueryBuilder(GameInfo, 'gameInfo')
          .innerJoinAndSelect('gameInfo.gameScores', 'gameScore')
          .innerJoinAndSelect('gameScore.user', 'user')
          .innerJoinAndSelect(
            '(' + subQuery.getQuery() + ')',
            subQueryAlias + 3, // Use the alias here as well
            `${subQueryAlias + 3}.gameId = gameScore.gameId`, // Use the alias in the join condition
          );

        console.log(qb.getQuery());
        const res2 = await qb.getMany();
        console.log(res2);

        return await manager.getRepository(GameInfo).find({
          relations: {
            gameScores: {
              game: true,
            },
          },
          select: {
            gameId: true,
            createDate: true,
            gameMap: true,
            gameScores: {
              score: true,
              user: {
                id: true,
                nickName: true,
                profile: true,
              },
            },
          },
        });
      },
    );
  }
}
