import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { testDatabase } from 'src/datasource/testDatabase';
import { StatusModule } from 'src/sockets/status/status.module';
import { DataSource } from 'typeorm';

describe('Status-Socket', () => {
  let app: INestApplication;
  let datasource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StatusModule, testDatabase],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    datasource = moduleFixture.get<DataSource>(DataSource);
  });
});
