import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { testDatabase } from 'src/datasource/testDatabase';
import { UserModule } from 'src/restapi/user/user.module';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { UpdateUserDto } from 'src/restapi/user/dto/update-user.dto';
import { user1 } from 'test/fixtures/users/user-1';
import { user2 } from 'test/fixtures/users/user-2';
import { appDatabase } from 'src/datasource/appdatabase';
import { UserFactory } from 'src/factory/user.factory';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { FriendsWith } from 'src/entities/user/friendsWith.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from 'src/entities/auth/token.entity';
import { GetFriendQueryDto } from 'src/restapi/user/dto/get-friend-query.dto';
import { CreateUserDto } from 'src/restapi/user/dto/create-user.dto';
import { CreateRequestFriendDto } from 'src/restapi/user/dto/create-request-friend.dto';
import { async } from 'rxjs';
import { Request, RequestType } from 'src/entities/user/request.entity';
import { InvitationStatus } from 'src/enum/invitation.enum';
import { SearchUserDto } from 'src/restapi/user/dto/search-user.dto';

describe('User -/user (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repository: Repository<User>;
  let friendRepository: Repository<FriendsWith>;
  let tokenRepository: Repository<Token>;
  let requestRepository: Repository<Request>;
  const factory: UserFactory = new UserFactory();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
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
    repository = dataSource.getRepository(User);
    tokenRepository = dataSource.getRepository(Token);
    requestRepository = dataSource.getRepository(Request);
    friendRepository = dataSource.getRepository(FriendsWith);
  });

  describe('PATCH /user/{id} test', () => {
    //defaultUser를 업데이트할때 사용할 dto

    const updateUserDto = new UpdateUserDto();

    it('PATCH /user/{id} success', async () => {
      const user1 = factory.createUser(1);
      await repository.save(user1);

      updateUserDto.nickName = 'updateNickname';
      updateUserDto.email = 'updateEmail';

      const res = await request(app.getHttpServer())
        .patch(`/user/${user1.id}`)
        .send(updateUserDto)
        .expect(200);

      const updatedUser = await repository.findOne({
        where: {
          id: user1.id,
        },
      });

      expect(updatedUser.nickName).toEqual(updateUserDto.nickName);
      expect(updatedUser.email).toEqual(updateUserDto.email);
    });

    it('PATCH /user/{id} not found', async () => {
      await request(app.getHttpServer())
        .patch(`/user/5`)
        .send(updateUserDto)
        .expect(404);
    });

    it('PATCH /user/{id} nickname confict error', async () => {
      const newUser = factory.createUser(2);
      await repository.save(newUser);
      const newUser2 = factory.createUser(3);
      await repository.save(newUser2);

      updateUserDto.nickName = 'user3';
      updateUserDto.email = 'updateEmail';

      await request(app.getHttpServer())
        .patch(`/user/${newUser.id}`)
        .send(updateUserDto)
        .expect(409);
    });

    it('PATCH /user/{id} email confict error', async () => {
      const newUser = factory.createUser(4);
      await repository.save(newUser);
      const newUser2 = factory.createUser(5);
      await repository.save(newUser2);

      updateUserDto.nickName = 'not confNickname';
      updateUserDto.email = 'loginEmail5'; // conflit with newUser

      await request(app.getHttpServer())
        .patch(`/user/${newUser2.id}`)
        .send(updateUserDto)
        .expect(409);
    });

    it('PATCH /user/{id} partial update', async () => {
      const user6 = factory.createUser(6);
      await repository.save(user6);

      updateUserDto.nickName = 'updateNickname6';
      updateUserDto.email = 'updateEmail6';
      updateUserDto.status = 'inGame';

      const res = await request(app.getHttpServer())
        .patch(`/user/${user6.id}`)
        .send(updateUserDto)
        .expect(200);

      const updatedUser = await repository.findOne({
        where: {
          id: user6.id,
        },
      });

      //update한 부분
      expect(updatedUser.nickName).toEqual(updateUserDto.nickName);

      //update하지 않은 부분
      expect(updatedUser.profile).toEqual(user6.profile);
    });

    describe('GET /me/friends/{id}', () => {
      const createUser7 = factory.createUser(7);
      createUser7.status = 'online';
      const createUser8 = factory.createUser(8);
      createUser8.status = 'inGame';
      const createUser9 = factory.createUser(9);
      createUser9.status = 'offline';
      const createUser10 = factory.createUser(10);

      let user7: User;
      let user8: User;
      let user9: User;
      let user10: User;

      beforeEach(async () => {
        await friendRepository.delete({ userId: 7 });
        await friendRepository.delete({ userId: 8 });
        await friendRepository.delete({ userId: 9 });
        await friendRepository.delete({ userId: 10 });
      });

      it('GET /me/friends/{id} success', async () => {
        user7 = await repository.save(createUser7);
        user8 = await repository.save(createUser8);
        user9 = await repository.save(createUser9);
        user10 = await repository.save(createUser10);
        await friendRepository.save({
          userId: user7.id,
          friendId: user8.id,
        });

        await friendRepository.save({
          userId: user7.id,
          friendId: user9.id,
        });

        await friendRepository.save({
          userId: user7.id,
          friendId: user10.id,
        });

        const res = await request(app.getHttpServer())
          .get('/user/me/friends/7')
          .expect(200);
        expect(res.body.length).toEqual(3);
      });

      it('GET /me/friends/{id} inversed success', async () => {
        user7 = await repository.save(createUser7);
        user8 = await repository.save(createUser8);
        user9 = await repository.save(createUser9);
        user10 = await repository.save(createUser10);
        await friendRepository.save({
          userId: user8.id,
          friendId: user7.id,
        });

        await friendRepository.save({
          userId: user9.id,
          friendId: user7.id,
        });

        await friendRepository.save({
          userId: user10.id,
          friendId: user7.id,
        });

        const res = await request(app.getHttpServer())
          .get('/user/me/friends/7')
          .expect(200);
        expect(res.body.length).toEqual(0);

        const res2 = await request(app.getHttpServer())
          .get('/user/me/friends/8')
          .expect(200);
        expect(res2.body.length).toEqual(1);
      });

      it('GET /me/friends/{id} query', async () => {
        const getFriendsDto = new GetFriendQueryDto();
        getFriendsDto.status = 'online';

        createUser7.status = 'online';
        createUser8.status = 'offline';
        createUser9.status = 'online';
        createUser10.status = 'offline';

        user7 = await repository.save(createUser7);
        user8 = await repository.save(createUser8);
        user9 = await repository.save(createUser9);
        user10 = await repository.save(createUser10);
        await friendRepository.save({
          userId: user7.id,
          friendId: user8.id,
        });

        await friendRepository.save({
          userId: user7.id,
          friendId: user9.id,
        });

        await friendRepository.save({
          userId: user7.id,
          friendId: user10.id,
        });

        const res = await request(app.getHttpServer())
          .get('/user/me/friends/7?status=online')
          .expect(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].id).toEqual(user9.id);

        const res2 = await request(app.getHttpServer())
          .get('/user/me/friends/7?status=offline')
          .expect(200);
        expect(res2.body.length).toEqual(2);
        expect(res2.body[0].id).toEqual(user8.id);

        const res3 = await request(app.getHttpServer())
          .get('/user/me/friends/7?status=all')
          .expect(200);
        expect(res3.body.length).toEqual(3);
      });
    });

    describe('POST /me/friends/{id}', () => {
      let user11 = factory.createUser(11);
      let user12 = factory.createUser(12);
      user12.status = 'online';
      let user13 = factory.createUser(13);
      user13.status = 'inGame';
      let user14 = factory.createUser(14);
      user14.status = 'offline';

      beforeAll(async () => {
        const realIds = [107112, 106987, 106982, 106930];

        await friendRepository.delete({ userId: 11 });
        await friendRepository.delete({ userId: 12 });
        await friendRepository.delete({ userId: 13 });
        await friendRepository.delete({ userId: 14 });

        user11 = await repository.save(user11);
        user12 = await repository.save(user12);
        user13 = await repository.save(user13);
        user14 = await repository.save(user14);

        for (const id of realIds) {
          const realUser = await repository.findOne({ where: { id: id } });
          if (realUser) {
            await friendRepository.save({
              userId: id,
              friendId: user11.id,
            });

            await friendRepository.save({
              userId: id,
              friendId: user12.id,
            });

            await friendRepository.save({
              userId: id,
              friendId: user13.id,
            });

            await friendRepository.save({
              userId: id,
              friendId: user14.id,
            });
          }
        }
      });

      afterAll(async () => {
        await friendRepository.delete({ userId: 11 });
        await friendRepository.delete({ userId: 12 });
        await friendRepository.delete({ userId: 13 });
        await friendRepository.delete({ userId: 14 });

        await repository.delete({ id: 11 });
        await repository.delete({ id: 12 });
        await repository.delete({ id: 13 });
        await repository.delete({ id: 14 });
      });

      it('success', async () => {
        const res = await request(app.getHttpServer())
          .post('/user/me/friends/11')
          .send({
            friendId: user12.id,
          })
          .expect(201);

        const res2 = await request(app.getHttpServer())
          .post('/user/me/friends/11')
          .send({
            friendId: user13.id,
          })
          .expect(201);

        const res3 = await request(app.getHttpServer())
          .post('/user/me/friends/11')
          .send({
            friendId: user14.id,
          });

        const friends = await friendRepository.find({
          where: {
            userId: 11,
          },
        });
        expect(friends.length).toEqual(3);
      });
    });
  });

  /**
   * using user 20 ~
   * */
  describe('POST /me/friend/request/{id}', () => {
    let user20: User;
    let user21: User;
    let user22: User;
    let user23: User;
    const createRequestFriendDto: CreateRequestFriendDto =
      new CreateRequestFriendDto();

    beforeAll(async () => {
      let newUserDto: CreateUserDto = factory.createUser(20);
      user20 = await repository.save(newUserDto);

      newUserDto = factory.createUser(21);
      user21 = await repository.save(newUserDto);

      newUserDto = factory.createUser(22);
      user22 = await repository.save(newUserDto);

      newUserDto = factory.createUser(23);
      user23 = await repository.save(newUserDto);
    });

    afterAll(async () => {
      await friendRepository.delete({});
      await requestRepository.delete({});
      await repository.delete({ id: 20 });
      await repository.delete({ id: 21 });
      await repository.delete({ id: 22 });
      await repository.delete({ id: 23 });
    });

    beforeEach(async () => {
      await requestRepository.clear();
    });

    it('20->21에게 친구요청 정상생성', async () => {
      createRequestFriendDto.requestedUserId = user21.id;
      await request(app.getHttpServer())
        .post('/user/me/friend/request/20')
        .send(createRequestFriendDto)
        .expect(201);
    });

    it('친구 요청자가 없음', async () => {
      createRequestFriendDto.requestedUserId = user21.id;
      await request(app.getHttpServer())
        .post('/user/me/friend/request/10000000')
        .send(createRequestFriendDto)
        .expect(404);
    });

    it('친구 요청 대상자가 없음', async () => {
      createRequestFriendDto.requestedUserId = 12345678;
      await request(app.getHttpServer())
        .post('/user/me/friend/request/20')
        .send(createRequestFriendDto)
        .expect(404);
    });

    it('친구 요청 대상자가 자기자신', async () => {
      createRequestFriendDto.requestedUserId = user20.id;
      await request(app.getHttpServer())
        .post('/user/me/friend/request/20')
        .send(createRequestFriendDto)
        .expect(400);
    });

    it('이미 친구', async () => {
      await friendRepository.save({
        userId: user20.id,
        friendId: user21.id,
      });

      await friendRepository.save({
        userId: user21.id,
        friendId: user20.id,
      });

      createRequestFriendDto.requestedUserId = user21.id;
      await request(app.getHttpServer())
        .post('/user/me/friend/request/20')
        .send(createRequestFriendDto)
        .expect(409);
    });

    it('이미 친구가 알람돼서 확인한 요청이 있음', async () => {
      //친구가 확인한 요청: PENDING
      await requestRepository.save({
        requestingUserId: user20.id,
        requestedUserId: user21.id,
        isAccepted: InvitationStatus.PENDING,
        requestType: RequestType.FRIEND,
      });

      createRequestFriendDto.requestedUserId = user21.id;
      await request(app.getHttpServer())
        .post('/user/me/friend/request/20')
        .send(createRequestFriendDto)
        .expect(409);
    });

    it('친구가 접속하지않아 알람되지 않은 요청이 있음', async () => {
      //친구가 확인은 안한 요청: NOTALARMED
      await requestRepository.save({
        requestingUserId: user22.id,
        requestedUserId: user23.id,
        isAccepted: InvitationStatus.NOTALARMED,
        requestType: RequestType.FRIEND,
      });

      createRequestFriendDto.requestedUserId = user23.id;
      await request(app.getHttpServer())
        .post('/user/me/friend/request/22')
        .send(createRequestFriendDto)
        .expect(409);
    });
  });

  describe('GET /search', () => {
    const searchUserDto: SearchUserDto = new SearchUserDto();

    beforeAll(async () => {
      const newUserDto: CreateUserDto = factory.createUser(30);
      newUserDto.nickName = '강명환';
      newUserDto.email = '강명환@naver.com';

      await repository.save(newUserDto);

      const newUserDto2: CreateUserDto = factory.createUser(31);
      newUserDto2.nickName = '김정환';
      newUserDto2.email = '김정환@naver.com';

      await repository.save(newUserDto2);
    });

    afterAll(async () => {
      repository.delete({ id: 30 });
      repository.delete({ id: 31 });
    });

    describe('nickName search', () => {
      it('~로 시작하는 유저', async () => {
        searchUserDto.nickName = '강명';

        const res = await request(app.getHttpServer())
          .get('/user/search')
          .query(searchUserDto)
          .expect(200);

        expect(res.body.length).toEqual(1);
        expect(res.body[0].nickName).toEqual('강명환');
      });

      it('~로 끝나는 유저', async () => {
        searchUserDto.nickName = '환';

        const res = await request(app.getHttpServer())
          .get('/user/search')
          .query(searchUserDto)
          .expect(200);

        expect(res.body.length).toEqual(2);
      });

      it('~를 포함하는 유저', async () => {
        searchUserDto.nickName = '명';

        const res = await request(app.getHttpServer())
          .get('/user/search')
          .query(searchUserDto)
          .expect(200);

        expect(res.body.length).toEqual(1);
      });
    });

    //     describe('email search', () => {
    //       it('~로 시작하는 유저', async () => {
    //         delete searchUserDto.nickName;
    //         searchUserDto.email = '강명';

    //         const res = await request(app.getHttpServer())
    //           .get('/user/search')
    //           .query(searchUserDto)
    //           .expect(200);

    //         expect(res.body.length).toEqual(1);
    //         expect(res.body[0].email).toEqual('강명환@naver.com');
    //       });

    //       it('~로 끝나는 유저', async () => {
    //         delete searchUserDto.nickName;
    //         searchUserDto.email = '환';

    //         const res = await request(app.getHttpServer())
    //           .get('/user/search')
    //           .query(searchUserDto)
    //           .expect(200);

    //         expect(res.body.length).toEqual(2);
    //       });

    //       it('도메인네임 검색 disable', async () => {
    //         delete searchUserDto.nickName;
    //         searchUserDto.email = 'naver.com';

    //         const res = await request(app.getHttpServer())
    //           .get('/user/search')
    //           .query(searchUserDto)
    //           .expect(200);

    //         expect(res.body.length).toEqual(0);
    //       });
    //     });
  });

  describe('GET /alarms', () => {
    describe('친구요청 알람', () => {});

    describe('채팅방 초대 알람', () => {});

    describe('게임 초대 알람', () => {});
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
