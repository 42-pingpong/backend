import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { testDatabase } from 'src/datasource/testDatabase';

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, testDatabase],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 10000);
});
