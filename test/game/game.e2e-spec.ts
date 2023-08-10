import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { appDatabase } from 'src/datasource/appdatabase';
import { testDatabase } from 'src/datasource/testDatabase';
import { GameInfo } from 'src/entities/game/gameInfo.entity';
import { GameScore } from 'src/entities/game/gameScore.entity';
import { User } from 'src/entities/user/user.entity';
import { UserFactory } from 'src/factory/user.factory';
import { AccessTokenGuard } from 'src/restapi/auth/Guards/accessToken.guard';
import { GameModule } from 'src/restapi/game/game.module';
import { DataSource, Repository } from 'typeorm';
import { CreateGameDto } from 'src/restapi/game/request/create-game.dto';
import * as request from 'supertest';
import { CreateGameScoreRequestDto } from 'src/restapi/game/request/create-game-score.dto';

describe('Game -/game (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repository: Repository<User>;
  let accGuard: AccessTokenGuard;
  let gameInfoRepository: Repository<GameInfo>;
  let gameScoreRepository: Repository<GameScore>;
  let userRepository: Repository<User>;
  const factory: UserFactory = new UserFactory();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GameModule],
      providers: [
        {
          provide: AccessTokenGuard,
          useValue: {
            canActivate: jest.fn(),
          },
        },
      ],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .overrideModule(TypeOrmModule)
      .useModule(TypeOrmModule.forFeature([GameInfo, GameScore, User]))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    dataSource = moduleFixture.get<DataSource>(DataSource);
    repository = dataSource.getRepository(User);
    accGuard = moduleFixture.get<AccessTokenGuard>(AccessTokenGuard);
    gameInfoRepository = dataSource.getRepository(GameInfo);
    gameScoreRepository = dataSource.getRepository(GameScore);
    userRepository = dataSource.getRepository(User);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  /**
   * user 3000 ~ 3009
   * */
  describe('POST /game', () => {
    let createGameDto: CreateGameDto;

    beforeAll(async () => {
      await gameInfoRepository.delete({});
      createGameDto = new CreateGameDto();
    });

    afterAll(async () => {
      await gameInfoRepository.delete({});
    });

    it('빈 dto, 정상 생성', async () => {
      delete createGameDto.gameMap;
      const res = await request(app.getHttpServer())
        .post('/game')
        .send(createGameDto)
        .expect(201);

      expect(res.body).toHaveProperty('gameId');
      expect(res.body).toHaveProperty('gameMap');
      expect(res.body.gameMap).toEqual('default');
    });

    it('게임 맵 지정', async () => {
      createGameDto.gameMap = 'testMap';
      const res = await request(app.getHttpServer())
        .post('/game')
        .send(createGameDto)
        .expect(201);

      expect(res.body).toHaveProperty('gameId');
      expect(res.body).toHaveProperty('gameMap');
      expect(res.body.gameMap).toEqual('testMap');
    });
  });

  /**
   * user 3010 ~ 3019
   * */
  describe('POST /game/score', () => {
    let user3010: User;
    let user3011: User;
    let gameInfo: GameInfo;
    const createGameScoreDto = new CreateGameScoreRequestDto();

    beforeAll(async () => {
      user3010 = await userRepository.save(factory.createUser(3010));
      user3011 = await userRepository.save(factory.createUser(3011));
      const gameInfoDto = new GameInfo();
      gameInfo = await gameInfoRepository.save(gameInfoDto);
    });

    afterAll(async () => {
      await gameScoreRepository.delete({});
      await gameInfoRepository.delete({
        gameId: gameInfo.gameId,
      });
      await userRepository.delete({
        id: user3010.id,
      });
      await userRepository.delete({
        id: user3011.id,
      });
    });

    it('유저가 없음', async () => {
      createGameScoreDto.gameId = gameInfo.gameId;
      createGameScoreDto.score = 3;
      createGameScoreDto.userId = 9999;

      const res = await request(app.getHttpServer())
        .post('/game/score')
        .send(createGameScoreDto);
      expect(res.status).toEqual(404);
    });

    it('게임이 없음', async () => {
      createGameScoreDto.gameId = 9999;
      createGameScoreDto.score = 3;
      createGameScoreDto.userId = user3010.id;

      const res = await request(app.getHttpServer())
        .post('/game/score')
        .send(createGameScoreDto);

      expect(res.status).toEqual(404);
    });

    it('정상 생성', async () => {
      createGameScoreDto.gameId = gameInfo.gameId;
      createGameScoreDto.score = 3;
      createGameScoreDto.userId = user3010.id;

      const res = await request(app.getHttpServer())
        .post('/game/score')
        .send(createGameScoreDto);

      expect(res.status).toEqual(201);
    });
  });

  describe('GET /game/history/:userId', () => {
    let user3020: User;
    let user3021: User;
    let user3022: User;
    let gameInfo: GameInfo;
    const createGameScoreDto = new CreateGameScoreRequestDto();

    beforeAll(async () => {
      user3020 = await userRepository.save(factory.createUser(3020));
      user3021 = await userRepository.save(factory.createUser(3021));
      user3022 = await userRepository.save(factory.createUser(3022));
      const gameInfoDto = new GameInfo();
      let id = (await gameInfoRepository.insert(gameInfoDto)).identifiers[0]
        .gameId;

      createGameScoreDto.gameId = id;
      createGameScoreDto.score = 3;
      createGameScoreDto.userId = user3020.id;

      await request(app.getHttpServer())
        .post('/game/score')
        .send(createGameScoreDto);

      createGameScoreDto.score = 5;
      createGameScoreDto.userId = user3021.id;
      await request(app.getHttpServer())
        .post('/game/score')
        .send(createGameScoreDto);

      //game 2
      id = (await gameInfoRepository.insert(gameInfoDto)).identifiers[0].gameId;
      console.log(id);
      createGameScoreDto.gameId = id;
      createGameScoreDto.score = 5;
      createGameScoreDto.userId = user3021.id;

      await request(app.getHttpServer())
        .post('/game/score')
        .send(createGameScoreDto);

      createGameScoreDto.score = 3;
      createGameScoreDto.userId = user3022.id;
      await request(app.getHttpServer())
        .post('/game/score')
        .send(createGameScoreDto);
    });

    afterAll(async () => {
      await gameScoreRepository.delete({});
      await gameInfoRepository.delete({});
      await userRepository.delete({
        id: user3020.id,
      });
      await userRepository.delete({
        id: user3021.id,
      });
    });

    it('History정보 요청한 유저가 없음.', async () => {
      await request(app.getHttpServer()).get(`/game/history/9999`).expect(404);
    });

    it('정상요청', async () => {
      const res = await request(app.getHttpServer())
        .get(`/game/history/${user3020.id}`)
        .expect(200);
      console.log(res.body[0]);
      console.log(res.body[0].gameScores);
    });
  });
});
