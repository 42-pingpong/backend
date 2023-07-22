import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { testDatabase } from 'src/datasource/testDatabase';
import { UserModule } from 'src/restapi/user/user.module';
import * as request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { UpdateUserDto } from 'src/restapi/user/dto/update-user.dto';

describe('User -/user (e2e)', () => {
  let app: INestApplication;
  let datasource: DataSource;
  let repository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [testDatabase, UserModule],
    }).compile();

    datasource = moduleFixture.get<DataSource>(DataSource);
    repository = datasource.getRepository(User);
    app = moduleFixture.createNestApplication();
    await moduleFixture.init();
    await app.listen(parseInt(process.env.NEST_PORT_E2E));
  });

  const defaultUser = new User();
  defaultUser.id = 1;
  defaultUser.nickName = 'test';
  defaultUser.level = 5.5;
  defaultUser.profile = 'ttt';
  defaultUser.email = 'defualtEmail';
  defaultUser.selfIntroduction = '00';

  describe('GET /user{id} test', () => {
    it('GET /user/{id} success', async () => {
      await repository.save(defaultUser);
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
      const newUser = new User();
      newUser.id = 2;
      newUser.nickName = 'newUser';
      newUser.level = 5.5;
      newUser.profile = 'ttt';
      newUser.email = 'newEmail';
      newUser.selfIntroduction = '00';

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
  });

  afterAll(async () => {
    await datasource.destroy();
    await app.close();
  });
});
