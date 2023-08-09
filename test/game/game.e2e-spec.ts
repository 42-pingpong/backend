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
import { CreateGameDto } from 'src/restapi/game/dto/create-game.dto';
import { GameModule } from 'src/restapi/game/game.module';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';

describe('Game -/game (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repository: Repository<User>;
  let accGuard: AccessTokenGuard;
  let gameInfoRepository: Repository<GameInfo>;
  let gameScoreRepository: Repository<GameScore>;
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
      .useModule(TypeOrmModule.forFeature([GameInfo, GameScore]))
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
  });

  /**
   * user 3000번대 사용
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

  describe('POST /game/history', () => {
    it.todo('');
    it.todo('');
    it.todo('');
    it.todo('');
  });

  describe('GET /game/history/:userId', () => {
    it.todo('');
    it.todo('');
    it.todo('');
    it.todo('');
  });
});
