import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { testDatabase } from 'src/datasource/testDatabase';
import { DataSource } from 'typeorm';
import { io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { appDatabase } from 'src/datasource/appdatabase';

describe('Status-Socket', () => {
  let app: INestApplication;
  let datasource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    datasource = moduleFixture.get<DataSource>(DataSource);
    app.listen(10009);
  });

  describe('Status-Socket', () => {
    it('login', async () => {});
  });

  afterAll(async () => {
    await app.close();
  });
});
