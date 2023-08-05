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
import { User } from 'src/entities/user/user.entity';
import { Token } from 'src/entities/auth/token.entity';

/**
 * @link https://medium.com/@tozwierz/testing-socket-io-with-jest-on-backend-node-js-f71f7ec7010f
 * */

describe('Status-Socket', () => {
  let socketApp: INestApplication;
  let restApp: INestApplication;
  let datasource: DataSource;
  let socket;
  let accToken;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [StatusModule],
    })
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

  beforeEach(async () => {
    // Setup
    //10000번 유저로 로그인
    const res = await request(restApp.getHttpServer())
      .get('/api/fakeauth/login')
      .query({
        id: 10000,
      });

    accToken = res.headers['location'].split('accessToken=')[1];

    //login
    await request(restApp.getHttpServer())
      .get('/api/user/me')
      .set('Authorization', 'Bearer ' + accToken)
      .expect(200);

    // Do not hardcode server port and address, square brackets are used for IPv6
    socket = io(
      `ws://[${restApp.getHttpServer().address().address}]:10051/status`,
      {
        transports: ['websocket'],
        forceNew: true,
        autoConnect: false,
        auth: (cb) => {
          const token = 'Bearer ' + accToken;
          cb({ token });
        },
      },
    );
    socket.on('connect', () => {
      console.log('connect');
    });
  });

  afterEach(async () => {
    socket.removeAllListeners();
    socket.disconnect();
    await datasource.getRepository(Token).delete({ ownerId: 10000 });
    await datasource.getRepository(User).delete({ id: 10000 });
  });

  afterAll(async () => {
    await socketApp.close();
    await restApp.close();
  });

  describe('connect', () => {
    it.todo('connect');
  });

  describe('disconnect', () => {
    it.todo('disconnect');
  });

  describe('request-friend', () => {
    it.todo('request-friend');
  });

  describe('checked-alarm', () => {
    it.todo('checked-alarm');
  });

  describe('accept-friend', () => {
    it.todo('accept-friend');
  });

  describe('reject-friend', () => {
    it.todo('reject-friend');
  });
});
