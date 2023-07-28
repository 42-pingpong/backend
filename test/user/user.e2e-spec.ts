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
import { ConfigService } from '@nestjs/config';
import { appDatabase } from 'src/datasource/appdatabase';
import { UserFactory } from './user.factory';

describe('User -/user (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let repository: Repository<User>;
  let factory: UserFactory;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, UserFactory],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    repository = dataSource.getRepository(User);
    factory = moduleFixture.get<UserFactory>(UserFactory);
  });

  const defaultUser = user1;

  describe('GET /user{id} test', () => {
    it('GET /user/{id} success', async () => {
      const rtn = await repository.save(defaultUser);
      const res = await request(app.getHttpServer()).get('/user/1').expect(200);
      expect(res.body).toEqual(defaultUser);
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
        const user7 = await repository.save(factory.createUser(7));
        const user8 = await repository.save(factory.createUser(8));
        const user9 = await repository.save(factory.createUser(9));
        const user10 = await  repository.save(factory.createUser(10));
		user7.friendsWith = [user8, user9, user10];
		user8.friendsWith = [user7, user10];

	  it('GET /me/friends/{id} success', async () => {
		const res = await request(app.getHttpServer()).get('/user/me/friends/7').expect(200);
		expect(res.body).toEqual([user8, user9, user10]);


	  }
    });

	describe('')
  });

  afterAll(async () => {
    await repository.delete(user1);
    await repository.delete(user2);
    await dataSource.destroy();
    await app.close();
  });
});
