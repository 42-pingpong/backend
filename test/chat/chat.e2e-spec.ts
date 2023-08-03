import {
  ConflictException,
  ForbiddenException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { appDatabase } from 'src/datasource/appdatabase';
import { testDatabase } from 'src/datasource/testDatabase';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { ChatModule } from 'src/restapi/chat/chat.module';
import { CreateGroupChatDto } from 'src/restapi/chat/dto/create-group-chat.dto';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { UserFactory } from 'test/user/user.factory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.entity';
import { AddAdminDto } from 'src/restapi/chat/dto/add-admin.dto';
import { DeleteAdminDto } from 'src/restapi/chat/dto/delete-admin.dto';
import { UpdateGroupChatDto } from 'src/restapi/chat/dto/update-group-chat.dto';
import exp from 'constants';
import { NotFoundError } from 'rxjs';

describe('Chat', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let groupChatRepository: Repository<GroupChat>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ChatModule],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .overrideModule(TypeOrmModule)
      .useModule(TypeOrmModule.forFeature([GroupChat, User]))
      .compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = module.get<DataSource>(DataSource);
    groupChatRepository = dataSource.getRepository(GroupChat);
    userRepository = dataSource.getRepository(User);
  });

  describe('POST /api/chat/groupChat', () => {
    it('should return 201', async () => {
      const uf = new UserFactory();

      const user = uf.createUser(101234);
      await userRepository.save(user);

      const createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Priv';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 101234;

      const response = await request(app.getHttpServer())
        .post('/chat/groupChat')
        .send(createChatDto);

      const result = await groupChatRepository.findOne({
        where: { chatName: createChatDto.chatName },
      });

      expect(result).toBeDefined();
      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/chat/groupChat/:groupChatId', () => {
    // it.todo('GET /api/chat/groupChat/:groupChatId');
    it('should return 200', async () => {
      const uf = new UserFactory();
      const user = uf.createUser(101234);
      await userRepository.save(user);
      const createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Priv';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 101234;

      const response = await request(app.getHttpServer())
        .post('/chat/groupChat')
        .send(createChatDto);

      const groupChat = await groupChatRepository.save(createChatDto);

      expect(groupChat).toBeDefined();
      expect(response.status).toBe(201);

      const response2 = await request(app.getHttpServer()).get(
        `/chat/groupChat/${groupChat.groupChatId}`,
      );

      expect(response2.status).toBe(200);
    });
  });

  describe('PATCH /api/chat/groupChat/:groupChatId', () => {
    // it.todo('PATCH /api/chat/groupChat/:groupChatId');
    it('should return 200', async () => {
      const uf = new UserFactory();
      const user = uf.createUser(101234);
      await userRepository.save(user);
      const createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Priv';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 101234;

      const response = await request(app.getHttpServer())
        .post('/chat/groupChat')
        .send(createChatDto);

      const groupChat = await groupChatRepository.save(createChatDto);

      expect(groupChat).toBeDefined();
      expect(response.status).toBe(201);

      const updateChatDto = new UpdateGroupChatDto();
      // updateChatDto.chatName = '테스트 채팅방2';
      // 형 채팅방 이름도 수정 가능해야하지 않나요?
      updateChatDto.password = '4321';
      updateChatDto.levelOfPublicity = 'Pub';
      updateChatDto.maxParticipants = 20;

      const response2 = await request(app.getHttpServer())
        .patch(`/chat/groupChat/${groupChat.groupChatId}`)
        .send(updateChatDto);

      expect(response2.status).toBe(200);
    });
  });

  describe('POST /api/chat/groupChat/:groupChatId/admin', () => {
    // it.todo('POST /api/chat/groupChat/:groupChatId/admin');
    it('should return 201', async () => {
      const uf = new UserFactory();
      const user1 = uf.createUser(101234);
      const user2 = uf.createUser(101235);
      await userRepository.save([user1, user2]);
      const createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Priv';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 101234;

      const groupChat = await groupChatRepository.save(createChatDto);

      expect(groupChat).toBeDefined();

      const addAdminDto = new AddAdminDto();
      addAdminDto.userId = 101234;
      addAdminDto.requestedId = 101235;

      //query param으로 받을때는 쿼리파라미터로 넣어줘야함
      //body는 send로, query는 query로 넣어줘야함
      const response = await request(app.getHttpServer()).post(
        `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${addAdminDto.userId}&requestedId=${addAdminDto.requestedId}`,
      );

      expect(response.status).toBe(201);

      const data = await groupChatRepository.find({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });

      expect(data[0].admin[0].id).toBe(addAdminDto.requestedId);

      // admin 권한 추가당하는 사람 예외처리
      // 1. admin권한 추가하려는 유저가 채팅방 owner인경우
      if (data[0].ownerId === addAdminDto.requestedId) {
        // throw new ForbiddenException('onwer를 admin으로 만들 수 없습니다.');
        expect(response.status).toBe(403);
      }
      // 2. admin권한 추가하려는 유저가 채팅방에 없는경우
      const adminToAdd = data[0].admin.find((admin) => {
        return admin.id === addAdminDto.requestedId;
      });
      if (!adminToAdd) {
        // throw new NotFoundException('채팅방에 없는 유저입니다.');
        expect(response.status).toBe(404);
      }
      // 3. admin권한 추가하려는 유저가 이미 admin인 경우
      if (data[0].admin.find((admin) => admin.id === addAdminDto.requestedId)) {
        // throw new ConflictException('이미 admin입니다.');
        expect(response.status).toBe(409);
      }
      // admin권한 추가하려는 사람 예외처리
      // 1. admin권한 추가하는 유저가 권한이 없는경우
      if (
        data[0].admin.find((admin) => admin.id !== addAdminDto.userId) &&
        data[0].ownerId !== addAdminDto.userId
      ) {
        // throw new ForbiddenException('admin이 아닙니다.');
        expect(response.status).toBe(403);
      }
      // 2. admin권한 추가하는 유저가 없는경우
      const adminToAdd2 = data[0].admin.find((admin) => {
        return admin.id === addAdminDto.userId;
      });
      if (!adminToAdd2) {
        // throw new NotFoundException('채팅방에 없는 유저입니다.');
        expect(response.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/chat/groupChat/:groupChatId/admin', () => {
    it('should return 200', async () => {
      const uf = new UserFactory();
      const user1 = uf.createUser(101234);
      const user2 = uf.createUser(101235);
      await userRepository.save([user1, user2]);
      const createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Priv';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 101234;

      const groupChat = await groupChatRepository.save(createChatDto);

      const addAdminDto = new AddAdminDto();
      addAdminDto.userId = 101234;
      addAdminDto.requestedId = 101235;

      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${addAdminDto.userId}&requestedId=${addAdminDto.requestedId}`,
        )
        .expect(201);

      const dataBeforeDelete = await groupChatRepository.find({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });
      expect(dataBeforeDelete[0].admin[0].id).toBe(addAdminDto.requestedId);

      const deleteAdminDto = new DeleteAdminDto();
      deleteAdminDto.userId = 101234;
      deleteAdminDto.requestedId = 101235;

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=${deleteAdminDto.requestedId}`,
        )
        .expect(200);

      const dataAfterDelete = await groupChatRepository.find({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });
      expect(dataAfterDelete[0].admin[0]).toBe(undefined);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
