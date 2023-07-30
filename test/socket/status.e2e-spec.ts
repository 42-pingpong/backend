import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { testDatabase } from 'src/datasource/testDatabase';
import { DataSource } from 'typeorm';
import { io } from 'socket.io-client';
import { AppModule } from 'src/app.module';
import { appDatabase } from 'src/datasource/appdatabase';
import { StatusGateway } from 'src/sockets/status/status.gateway';

async function createNestApp(...gateways): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  })
    .overrideModule(appDatabase)
    .useModule(testDatabase)
    .overrideModule(AppConfigModule)
    .useModule(TestConfigModule)
    .compile();

  const app = testingModule.createNestApplication();
  return app;
}

describe('Status-Socket', () => {
  let app: INestApplication;
  let datasource: DataSource;

  it('login', async () => {
    app = await createNestApp(StatusGateway);
    await app.listen(3000);
  });

  afterAll(async () => {
    await datasource.destroy();
    await app.close();
  });
});
