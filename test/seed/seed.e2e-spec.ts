import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { testDatabase } from 'src/datasource/testDatabase';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { appDatabase } from 'src/datasource/appdatabase';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { FriendsWith } from 'src/entities/user/friendsWith.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'src/entities/auth/token.entity';
import { AppModule } from 'src/app.module';
import userSeeder from './user';

describe('Seeding Database', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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
    it('Seeding User', async () => {
      await userSeeder(dataSource);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
