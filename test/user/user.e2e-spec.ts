import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { testDatabase } from 'src/datasource/testDatabase';
import { UserModule } from 'src/restapi/user/user.module';
import * as request from 'supertest';
import { UserController } from 'src/restapi/user/user.controller';
import { UserService } from 'src/restapi/user/user.service';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/entities/user/user.entity';

describe('User -/user (e2e)', () => {
  let app: INestApplication;
  let controller: UserController;
  let service: UserService;
  let datasource: DataSource;
  let repository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [testDatabase, UserModule],
    }).compile();

    datasource = moduleFixture.get<DataSource>(DataSource);
    // controller = moduleFixture.get<UserController>(UserController);
    // service = moduleFixture.get<UserService>(UserService);
    // repository = datasource.getRepository(User);
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    jest.setTimeout(30000);
    await moduleFixture.init();
  }, 30000);

  it('GET /api/user/{:id}', () => {
    return request(app.getHttpServer())
      .get('/api/user/1')
      .expect(200)
      .timeout(10000);
  });

  afterAll(async () => {
    await datasource.destroy();
  });
});
