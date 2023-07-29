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
import { UserFactory } from './user.factory';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { FriendsWith } from 'src/entities/user/friendsWith.entity';

describe('User -/user (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repository: Repository<User>;
  let friendRepository: Repository<FriendsWith>;
  const factory: UserFactory = new UserFactory();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    repository = dataSource.getRepository(User);
    friendRepository = dataSource.getRepository(FriendsWith);
  });

  const defaultUser = user1;

  describe('GET /user{id} test', () => {
    it('GET /user/{id} success', async () => {
      const rtn = await repository.save(defaultUser);
      const res = await request(app.getHttpServer()).get('/user/1').expect(200);
      expect(res.body.id).toEqual(defaultUser.id);
    });

    it('GET /user/{id} not found', async () => {
      return request(app.getHttpServer()).get('/user/5').expect(404);
    });
  });

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
      let user7;
      let user8;
      let user9;
      let user10;

      beforeAll(async () => {
        user7 = await repository.save(factory.createUser(7));
        user8 = await repository.save(factory.createUser(8));
        user9 = await repository.save(factory.createUser(9));
        user10 = await repository.save(factory.createUser(10));
      });

      afterAll(async () => {
        await repository.delete(user7);
        await repository.delete(user8);
        await repository.delete(user9);
        await repository.delete(user10);
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

        const res = await request(app.getHttpServer())
          .get('/user/me/friends/7')
          .expect(200);
        console.log(res.body);
        expect(res.body[0].friendId).toEqual(user8.id);
        expect(res.body[1].friendId).toEqual(user9.id);
      });
    });
  });

  afterAll(async () => {
    await repository.delete(user1);
    await repository.delete(user2);
    await dataSource.destroy();
    await app.close();
  });
});
