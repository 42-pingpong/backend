import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { testDatabase } from 'src/datasource/testDatabase';
import { DataSource, In } from 'typeorm';
import { io } from 'socket.io-client';
import { appDatabase } from 'src/datasource/appdatabase';
import { StatusModule } from 'src/sockets/status/status.module';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { RestapiModule } from 'src/restapi/restapi.module';
import { User } from 'src/entities/user/user.entity';
import { Token } from 'src/entities/auth/token.entity';
import { ChatModule } from 'src/sockets/chat/chat.module';
import { KickUserDto } from '../../src/sockets/chat/request/kickUser.dto';
import { GroupChat } from '../../src/entities/chat/groupChat.entity';
import { UserFactory } from '../../src/factory/user.factory';
import { ChatFactory } from '../../src/factory/chat.factory';
import { BanDto } from '../../src/sockets/chat/request/ban.dto';

/**
 * @link https://medium.com/@tozwierz/testing-socket-io-with-jest-on-backend-node-js-f71f7ec7010f
 * */

describe('Socket', () => {
  let socketApp: INestApplication;
  let restApp: INestApplication;
  let datasource: DataSource;
  let StatusSocketClient;
  let ChatSocketClient;
  let GameSocketClient;
  let accToken;

  const userFactory = new UserFactory();
  const chatFactory = new ChatFactory();

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [StatusModule, ChatModule],
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
    // Do not hardcode server port and address, square brackets are used for IPv6
    StatusSocketClient = io(
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

    ChatSocketClient = io(
      `ws://[${restApp.getHttpServer().address().address}]:10051/chat`,
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

    // StatusSocketClient = io(
    //   `ws://[${restApp.getHttpServer().address().address}]:10051/status`,
    //   {
    //     transports: ['websocket'],
    //     forceNew: true,
    //     autoConnect: false,
    //     auth: (cb) => {
    //       const token = 'Bearer ' + accToken;
    //       cb({ token });
    //     },
    //   },
    // );
  });

  afterEach(async () => {
    StatusSocketClient.removeAllListeners();
    StatusSocketClient.disconnect();
    ChatSocketClient.removeAllListeners();
    ChatSocketClient.disconnect();
  });

  afterAll(async () => {
    await socketApp.close();
    await restApp.close();
  });

  describe('Status', () => {
    it.todo('connect');
    it.todo('disconnect');
    it.todo('request-friend');
    it.todo('데이터베이스 변경 확인');
    it.todo('database 변경확인');
    it.todo('requesting user에게 accept 알람 확인');
    it.todo('database 변경확인');
    it.todo('requesting user에게 reject 알람 확인');
  });

  describe('Chat', () => {
    /**
     * owner
     * */
    let user10000: User;
    /**
     * admin
     * */
    let user10001: User;
    /**
     * joinedUser
     */
    let user10002: User;

    /**
     * joinedUser
     */
    let user10003: User;
    let groupChat10000: GroupChat;

    beforeEach(async () => {
      console.log('beforeEach');
      user10000 = await datasource
        .getRepository(User)
        .save(userFactory.createUser(10000));

      user10001 = await datasource
        .getRepository(User)
        .save(userFactory.createUser(10001));
      user10002 = await datasource
        .getRepository(User)
        .save(userFactory.createUser(10002));
      user10003 = await datasource
        .getRepository(User)
        .save(userFactory.createUser(10003));
      groupChat10000 = await datasource
        .getRepository(GroupChat)
        .save(chatFactory.createPubChat(user10000.id, 10001));
      // Setup
      //10000번 유저로 로그인
      const res = await request(restApp.getHttpServer())
        .get('/api/fakeauth/login')
        .query({
          id: user10000.id,
        });

      accToken = res.headers['location'].split('accessToken=')[1];

      //login
      await request(restApp.getHttpServer())
        .get('/api/user/me')
        .set('Authorization', 'Bearer ' + accToken)
        .expect(200);
      await datasource
        .createQueryBuilder(GroupChat, 'groupChat')
        .relation('admin')
        .of(groupChat10000)
        .add(user10001);

      await datasource
        .createQueryBuilder(GroupChat, 'groupChat')
        .relation('joinedUser')
        .of(groupChat10000)
        .add([user10002, user10003]);
    });

    afterEach(async () => {
      console.log('afterEach');
      ChatSocketClient.removeAllListeners();
      ChatSocketClient.disconnect();
      await datasource
        .createQueryBuilder(GroupChat, 'groupChat')
        .relation('admin')
        .of(groupChat10000)
        .remove(user10001);

      await datasource
        .createQueryBuilder(GroupChat, 'groupChat')
        .relation('joinedUser')
        .of(groupChat10000)
        .remove([user10002, user10003]);

      await datasource
        .createQueryBuilder(GroupChat, 'groupChat')
        .delete()
        .execute();

      await datasource.getRepository(Token).delete({
        ownerId: In([user10000.id, user10001.id, user10002.id, user10003.id]),
      });
      await datasource.createQueryBuilder(User, 'user').delete().execute();
    });

    it('kick', (done) => {
      ChatSocketClient.connect();
      ChatSocketClient.on('kick-user', (data) => {
        expect(data.groupChatId).toBe(groupChat10000.groupChatId);
        expect(data.userId).toBe(user10002.id);
        done();
      });
      ChatSocketClient.on('error', (data) => {
        expect(data).toBeNull();
        done();
      });
      const kickUserDto = new KickUserDto();
      kickUserDto.requestUserId = user10000.id;
      kickUserDto.kickUserId = user10002.id;
      kickUserDto.groupChatId = groupChat10000.groupChatId;
      console.log(kickUserDto);
      ChatSocketClient.emit('kick-user', kickUserDto);
    });

    it('ban owner -> joinedUser', (done) => {
      ChatSocketClient.connect();
      ChatSocketClient.on('ban-user', (data) => {
        expect(data.groupChatId).toBe(groupChat10000.groupChatId);
        expect(data.userId).toBe(user10002.id);
        done();
      });
      ChatSocketClient.on('error', (data) => {
        expect(data).toBeNull();
        done();
      });
      const dto = new BanDto();

      dto.groupChatId = groupChat10000.groupChatId;
      dto.userId = user10000.id;
      dto.bannedId = user10002.id;
      ChatSocketClient.emit('ban-user', dto);
    });
    // it('unban', (done) => {});
  });
});
