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

describe('User -/user (e2e)', () => {
  let datasource: DataSource;
  let repository: Repository<User>;
  let configService: ConfigService;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [testDatabase],
    }).compile();

    datasource = moduleFixture.get<DataSource>(DataSource);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    repository = datasource.getRepository(User);
    agent = request.agent(configService.get<string>('url.testUrl'));
  });

  const defaultUser = user1;

  describe('GET /user{id} test', () => {
    it('GET /user/{id} success', async () => {
      const rtn = await repository.save(defaultUser);
      console.log(rtn);
      const res = await agent.get('/user/1').expect(200);
      expect(res.body).toEqual(defaultUser);
    });

    it('GET /user/{id} not found', async () => {
      return agent.get('/user/5').expect(404);
    });
  });

  describe('PATCH /user/{id} test', () => {
    //defaultUser를 업데이트할때 사용할 dto
    const updateUserDto = new UpdateUserDto();
    it('PATCH /user/{id} success', async () => {
      updateUserDto.nickName = 'updateNickname';
      updateUserDto.email = 'updateEmail';

      const res = await agent
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
      await agent.patch(`/user/5`).send(updateUserDto).expect(404);
    });

    it('PATCH /user/{id} nickname confict error', async () => {
      const newUser = user2;

      await repository.save(newUser);

      updateUserDto.nickName = 'newUser';
      updateUserDto.email = 'updateEmail';

      await agent
        .patch(`/user/${defaultUser.id}`)
        .send(updateUserDto)
        .expect(409);
    });

    it('PATCH /user/{id} email confict error', async () => {
      updateUserDto.nickName = 'not confNickname';
      updateUserDto.email = 'newEmail'; // conflit with newUser

      await agent
        .patch(`/user/${defaultUser.id}`)
        .send(updateUserDto)
        .expect(409);
    });
  });

  afterAll(async () => {
    await datasource.destroy();
  });
});
