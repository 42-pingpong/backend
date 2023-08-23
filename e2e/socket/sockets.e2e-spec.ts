import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from '@app/common/config/app.config';
import { TestConfigModule } from '@app/common/config/test.config';
import { testDatabase } from '@app/common/datasource/testDatabase';
import { DataSource, In } from 'typeorm';
import { io } from 'socket.io-client';
import { appDatabase } from '@app/common/datasource/appdatabase';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { RestapiModule } from '../../apps/restapis/src/restapiModule';
import { User } from '@app/common/entities/user.entity';
import { Token } from '@app/common/entities/token.entity';
import { KickUserDto } from '../../apps/sockets/src/chat/request/kickUser.dto';
import { GroupChat } from '@app/common/entities/groupChat.entity';
import { UserFactory } from '@app/common/factory/user.factory';
import { ChatFactory } from '@app/common/factory/chat.factory';
import { BanDto } from '../../apps/sockets/src/chat/request/ban.dto';
import { UnBanUserDto } from '../../apps/sockets/src/chat/request/unBanUser.dto';
import { MuteUserDto } from '../../apps/sockets/src/chat/request/muteUser.dto';
import { UnmuteUserDto } from '../../apps/sockets/src/chat/request/unMute.dto';
import { MutedUserJoin } from '@app/common/entities/mutedUserJoin.entity';
import { StatusModule } from '../../apps/sockets/src/status/status.module';
import { ChatModule } from '../../apps/sockets/src/chat/chat.module';
import { ChatGatewayService } from '../../apps/sockets/src/chat/chat.gateway.service';
import { Socket } from 'socket.io-client';
/**
 * @link https://medium.com/@tozwierz/testing-socket-io-with-jest-on-backend-node-js-f71f7ec7010f
 * */

describe('Socket', () => {
  let socketApp: INestApplication;
  let restApp: INestApplication;
  let datasource: DataSource;
  let StatusSocketClient: Socket;
  let GameSocketClient: any;
  let accToken: string;
  let socketModule: TestingModule;

  const userFactory = new UserFactory();
  const chatFactory = new ChatFactory();

  beforeAll(async () => {
    socketModule = await Test.createTestingModule({
      imports: [StatusModule, ChatModule],
    })
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .compile();

    socketApp = socketModule.createNestApplication();
    await socketApp.listen(10051);

    console.log(socketApp.getHttpServer().address().address);

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

  afterAll(async () => {
    await socketApp.close();
    await restApp.close();
  });

  describe('Status', () => {
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
    });
    afterEach(async () => {
      StatusSocketClient.removeAllListeners();
      StatusSocketClient.disconnect();
    });
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
    let accToken: string;
    /**
     * owner
     * */
    let user10000: User;
    let ChatSocketClient: Socket;
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

      // Setup
      //10000번 유저로 로그인
      const res = await request(restApp.getHttpServer())
        .get('/api/fakeauth/login')
        .query({
          id: user10000.id,
        });
      accToken = res.headers['location'].split('accessToken=')[1];
      console.log(
        `ws://[${socketApp.getHttpServer().address().address}]:10051/chat`,
      );
      ChatSocketClient = io(
        `ws://[${socketApp.getHttpServer().address().address}]:10051/chat`,
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
      //login
      await request(restApp.getHttpServer())
        .get('/api/user/me')
        .set('Authorization', 'Bearer ' + accToken)
        .expect(200);
      accToken = res.headers['location'].split('accessToken=')[1];

      let tmpToken;
      //10001번 유저로 로그인
      const res2 = await request(restApp.getHttpServer())
        .get('/api/fakeauth/login')
        .query({
          id: user10001.id,
        });
      const tmpToken1 = res2.headers['location'].split('accessToken=')[1];
      await request(restApp.getHttpServer())
        .get('/api/user/me')
        .set('Authorization', 'Bearer ' + tmpToken1)
        .expect(200);

      //10002번 유저로 로그인
      const res3 = await request(restApp.getHttpServer())
        .get('/api/fakeauth/login')
        .query({
          id: user10002.id,
        });
      const tmpToken2 = res3.headers['location'].split('accessToken=')[1];

      await request(restApp.getHttpServer())
        .get('/api/user/me')
        .set('Authorization', 'Bearer ' + tmpToken2)
        .expect(200);

      //10003번 유저로 로그인
      const res4 = await request(restApp.getHttpServer())
        .get('/api/fakeauth/login')
        .query({
          id: user10003.id,
        });
      const tmpToken3: string =
        res4.headers['location'].split('accessToken=')[1];
      await request(restApp.getHttpServer())
        .get('/api/user/me')
        .set('Authorization', 'Bearer ' + tmpToken3)
        .expect(200);
    });

    afterEach(async () => {
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
        .createQueryBuilder(MutedUserJoin, 'mj')
        .delete()
        .execute();

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
      ChatSocketClient.on('kick-user', (data: any) => {
        console.log(data);
        expect(data.groupChatId).toBe(groupChat10000.groupChatId);
        expect(data.userId).toBe(user10002.id);
        done();
      });
      ChatSocketClient.on('error', (data: any) => {
        expect(data).toBeNull();
        done();
      });
      console.log(ChatSocketClient.connected);

      const kickUserDto = new KickUserDto();
      kickUserDto.requestUserId = user10000.id;
      kickUserDto.kickUserId = user10002.id;
      kickUserDto.groupChatId = groupChat10000.groupChatId;
      ChatSocketClient.emit('kick-user', kickUserDto);
    });

    it('ban', (done) => {
      ChatSocketClient.connect();
      ChatSocketClient.on('ban-user', (data: any) => {
        console.log(data);
        expect(data.groupChatId).toBe(groupChat10000.groupChatId);
        expect(data.userId).toBe(user10002.id);
        done();
      });
      ChatSocketClient.on('error', (data: any) => {
        expect(data).toBeNull();
        done();
      });

      const dto = new BanDto();

      dto.groupChatId = groupChat10000.groupChatId;
      dto.userId = user10000.id;
      dto.bannedId = user10002.id;
      ChatSocketClient.emit('ban-user', dto);
    }, 10000);

    it('unBan', (done) => {
      ChatSocketClient.connect();

      ChatSocketClient.on('unban-user', (data: any) => {
        console.log(data);
        expect(data.groupChatId).toBe(groupChat10000.groupChatId);
        expect(data.userId).toBe(user10002.id);
        done();
      });

      ChatSocketClient.on('error', (data: any) => {
        expect(data).toBeNull();
        done();
      });
      const dto = new BanDto();

      dto.groupChatId = groupChat10000.groupChatId;
      dto.userId = user10000.id;
      dto.bannedId = user10002.id;
      ChatSocketClient.emit('ban-user', dto);

      const unbandto = new UnBanUserDto();
      unbandto.groupChatId = groupChat10000.groupChatId;
      unbandto.userId = user10000.id;
      unbandto.bannedId = user10002.id;
      ChatSocketClient.emit('unban-user', unbandto);
    });

    it('mute', (done) => {
      ChatSocketClient.connect();

      ChatSocketClient.on('error', (data: any) => {
        console.log(data);
        expect(data).toBeNull();
        done();
      });

      ChatSocketClient.on('mute-user', (data: any) => {
        console.log(data);
        expect(data.groupChatId).toBe(groupChat10000.groupChatId);
        expect(data.userId).toBe(user10002.id);
        expect(data.muteFor).toBe(60000);
        done();
      });
      const dto = new MuteUserDto();

      dto.groupChatId = groupChat10000.groupChatId;
      dto.requestUserId = user10000.id;
      dto.userId = user10002.id;
      dto.unit = 'm';
      dto.time = 1;
      ChatSocketClient.emit('mute-user', dto);
    });

    it('unmute', (done) => {
      ChatSocketClient.connect();

      ChatSocketClient.on('error', (data: any) => {
        console.log(data);
        expect(data).toBeNull();
        done();
      });

      ChatSocketClient.on('unmute-user', (data: any) => {
        console.log(data);
        expect(data.groupChatId).toBe(groupChat10000.groupChatId);
        expect(data.userId).toBe(user10002.id);
        done();
      });

      const dto = new UnmuteUserDto();
      dto.groupChatId = groupChat10000.groupChatId;
      dto.requestUserId = user10000.id;
      dto.userId = user10002.id;

      ChatSocketClient.emit('unmute-user', dto);
    });
  });
});
