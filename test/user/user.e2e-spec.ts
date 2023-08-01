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

describe('User -/user (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repository: Repository<User>;
  let friendRepository: Repository<FriendsWith>;
  let tokenRepository: Repository<Token>;
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
    friendRepository = dataSource.getRepository(FriendsWith);
  });

  const defaultUser = user1;

  describe('PATCH /user/{id} test', () => {
    //defaultUser를 업데이트할때 사용할 dto
    const updateUserDto = new UpdateUserDto();
    it('PATCH /user/{id} success', async () => {
      updateUserDto.nickName = 'updateNickname';
      updateUserDto.email = 'updateEmail';

      const res = await request(app.getHttpServer())
        .patch(`/user/${defaultUser.id}`)
        .send(updateUserDto)
        .expect(200);

      const updatedUser = await repository.findOne({
        where: {
          id: defaultUser.id,
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
      const newUser = user2;

      await repository.save(newUser);

      updateUserDto.nickName = 'newUser';
      updateUserDto.email = 'updateEmail';

      await request(app.getHttpServer())
        .patch(`/user/${defaultUser.id}`)
        .send(updateUserDto)
        .expect(409);
    });

    it('PATCH /user/{id} email confict error', async () => {
      updateUserDto.nickName = 'not confNickname';
      updateUserDto.email = 'newEmail'; // conflit with newUser

      await request(app.getHttpServer())
        .patch(`/user/${defaultUser.id}`)
        .send(updateUserDto)
        .expect(409);
    });

    describe('GET /me/friends/{id}', () => {
      const createUser7 = factory.createUser(7);
      createUser7.status = 'online';
      const createUser8 = factory.createUser(8);
      createUser8.status = 'inGame';
      const createUser9 = factory.createUser(9);
      createUser9.status = 'offline';
      const createUser10 = factory.createUser(10);

      let user7;
      let user8;
      let user9;
      let user10;

      beforeAll(async () => {
        await friendRepository.delete({ userId: 7 });
        await friendRepository.delete({ userId: 8 });
        await friendRepository.delete({ userId: 9 });
        await friendRepository.delete({ userId: 10 });

        user7 = await repository.save(createUser7);
        user8 = await repository.save(createUser8);
        user9 = await repository.save(createUser9);
        user10 = await repository.save(createUser10);
      });

      it('GET /me/friends/{id} success', async () => {
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
        console.log(res.body);
        expect(res.body[0].friendId).toEqual(user8.id);
        expect(res.body[1].friendId).toEqual(user9.id);
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

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
