import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import userSeeder from './user';
import chatSeeder from './chat';
import { RestapiModule } from '../../apps/restapis/src/restapiModule';
import { testDatabase } from '@app/common/datasource/testDatabase';
import { appDatabase } from '@app/common/datasource/appdatabase';
import { AppConfigModule } from '@app/common/config/app.config';
import { TestConfigModule } from '@app/common/config/test.config';
import { User } from '@app/common/entities/user.entity';
import { FriendsWith } from '@app/common/entities/friendsWith.entity';
import { Token } from '@app/common/entities/token.entity';

describe('Seeding Database', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestapiModule],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .overrideModule(TypeOrmModule)
      .useModule(TypeOrmModule.forFeature([User, FriendsWith, Token]))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  describe('Seeding Database', () => {
    it('Seeding', async () => {
      await userSeeder(dataSource);
      await chatSeeder(dataSource);
    }, 100000);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
