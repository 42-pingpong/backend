import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { testDatabase } from 'src/datasource/testDatabase';
import { DataSource } from 'typeorm';
import { io } from 'socket.io-client';
import { appDatabase } from 'src/datasource/appdatabase';
import { StatusModule } from 'src/sockets/status/status.module';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { RestapiModule } from 'src/restapi/restapi.module';

/**
 * @link https://medium.com/@tozwierz/testing-socket-io-with-jest-on-backend-node-js-f71f7ec7010f
 * */

describe('Status-Socket', () => {
  let socketApp: INestApplication;
  let restApp: INestApplication;
  let datasource: DataSource;
  let socket;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [StatusModule],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .compile();

    socketApp = moduleFixture.createNestApplication();
    await socketApp.listen(10051);

    const moduleFixture2: TestingModule = await Test.createTestingModule({
      imports: [RestapiModule],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .compile();

    restApp = moduleFixture2.createNestApplication();
    restApp.use(cookieParser());

    restApp.setGlobalPrefix('api');
    //CORS
    restApp.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders:
        'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
    });

    restApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await restApp.listen(10050);
    datasource = moduleFixture2.get<DataSource>(DataSource);
  });

  beforeEach(() => {
    // Setup
    // Do not hardcode server port and address, square brackets are used for IPv6
    socket = io(`ws://localhost:10051/status`, {
      transports: ['websocket'],
      forceNew: true,
    });
    socket.on('connect', () => {
      console.log('connect');
    });

    socket.emit('checked-alarm', { requestId: 5 });
  });

  afterEach(() => {
    // Cleanup
    if (socket.connected) {
      socket.disconnect();
    }
  });

  afterAll(async () => {
    await socket.disconnect();
    await socketApp.close();
    await restApp.close();
  });

  it('checked-alarms', async () => {
    //https://github.com/ladjs/supertest

    const res = await request(restApp.getHttpServer())
      .get('/api/fakeauth/login')
      .query({
        id: 5,
      });

    console.log(res);
  });
});
