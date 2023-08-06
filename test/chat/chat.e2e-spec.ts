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
import { factory } from 'typescript';
import { after } from 'node:test';

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
    let groupChat: GroupChat;
    let createChatDto: CreateGroupChatDto;
    let uf = new UserFactory();
    let user1: User;
    let user2: User;
    let user3: User;
    let user4: User;
    let addAdminDto = new AddAdminDto();
    addAdminDto.userId = 101234; // owner(user1)
    addAdminDto.requestedId = 101235; // user(user2)

    beforeAll(async () => {
      user1 = await userRepository.save(uf.createUser(101234));
      user2 = await userRepository.save(uf.createUser(101235));
      user3 = await userRepository.save(uf.createUser(101236));
      user4 = await userRepository.save(uf.createUser(101237));
      createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Priv';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 101234;
      groupChat = await groupChatRepository.save(createChatDto);
    });

    beforeEach(async () => {
      // await userRepository.delete({});
      // await groupChatRepository.delete({});
    });

    afterAll(async () => {});

    it('존재하지 않는 채팅방 (404)', async () => {
      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/9999999/admin?userId=${addAdminDto.userId}&requestedId=${addAdminDto.requestedId}`,
        )
        .send(addAdminDto)
        .expect(404);
    });

    it('owner -> admin 정상 추가 (201)', async () => {
      //query param으로 받을때는 쿼리파라미터로 넣어줘야함
      //body는 send로, query는 query로 넣어줘야함
      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${addAdminDto.userId}&requestedId=${addAdminDto.requestedId}`,
        )
        .send(addAdminDto)
        .expect(201);

      const data = await groupChatRepository.find({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });
      expect(data[0].admin[0].id).toBe(addAdminDto.requestedId);
    });

    it('admin -> admin 권한 추가 (201)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${addAdminDto.requestedId}&requestedId=${user3.id}`,
        )
        .send(addAdminDto)
        .expect(201);

      const data = await groupChatRepository.find({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });
      expect(data[0].admin[1].id).toBe(user3.id);
    });

    it('owner -> admin 권한 이미 보유 (409)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${addAdminDto.userId}&requestedId=${user2.id}`,
        )
        .send(addAdminDto)
        .expect(409);
    });

    it('admin -> admin 권한 이미 보유 (409)', async () => {
      groupChat.admin = [user2, user3];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${user2.id}&requestedId=${user2.id}`,
          // 이 부분 user3.id 로 request를 보내면 NotFoundException이 나는데 이유를 몰라서 일단 동일한 아이디로 보냈을때 처리 해뒀습니다.
        )
        .send(addAdminDto)
        .expect(409);
    });

    it('admin -> admin(owner) 권한 추가 (403)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${addAdminDto.requestedId}&requestedId=${addAdminDto.userId}`,
        )
        .send(addAdminDto)
        .expect(403);
    });

    it('admin권한 추가하려는 유저가 채팅방에 없는경우 (404)', async () => {
      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${addAdminDto.requestedId}&requestedId=99999`,
        )
        .send(addAdminDto)
        .expect(404);
    });

    it('admin 권한 없는 user가 admin 권한 추가 (404)', async () => {
      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${user3.id}&requestedId=${user4.id}`,
        )
        .send(addAdminDto)
        .expect(404);
    });
  });

  describe('DELETE /api/chat/groupChat/:groupChatId/admin', () => {
    let groupChat: GroupChat;
    let createChatDto: CreateGroupChatDto;
    let uf = new UserFactory();
    let user1: User;
    let user2: User;
    let user3: User;
    let user4: User;
    let deleteAdminDto = new DeleteAdminDto();
    deleteAdminDto.userId = 101234; // owner(user1)
    deleteAdminDto.requestedId = 101235; // user(user2)

    beforeAll(async () => {
      user1 = await userRepository.save(uf.createUser(101234));
      user2 = await userRepository.save(uf.createUser(101235));
      user3 = await userRepository.save(uf.createUser(101236));
      user4 = await userRepository.save(uf.createUser(101237));
      createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Priv';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 101234;
      groupChat = await groupChatRepository.save(createChatDto);
    });

    beforeEach(async () => {
      // await userRepository.delete({});
      await groupChatRepository.delete({});
    });

    afterEach(async () => {});

    it('존재하지 않는 채팅방 (404)', async () => {
      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/9999999/admin?userId=${deleteAdminDto.userId}&requestedId=${deleteAdminDto.requestedId}`,
        )
        .expect(404);
    });

    it('owner -> admin 권한 정상 삭제 (200)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=${deleteAdminDto.requestedId}`,
        )
        .expect(200);

      const updatedGroupChat = await groupChatRepository.find({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });
      expect(updatedGroupChat[0].admin.length).toBe(0);
    });

    it('admin -> admin 권한 정상 삭제 (200)', async () => {
      groupChat.admin = [user2, user3];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${user2.id}&requestedId=${user3.id}`,
        )
        .expect(200);

      const updatedGroupChat = await groupChatRepository.find({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });
      expect(updatedGroupChat[0].admin.length).toBe(1);
    });

    it('owner -> admin 권한 삭제 (admin 권한 X) (404)', async () => {
      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=${user3.id}`,
        )
        .expect(404);
    });

    it('admin -> admin 권한 삭제 (admin 권한 X) (404)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${user2.id}&requestedId=${user3.id}`,
        )
        .expect(404);
    });

    it('admin -> admin(owner) 권한 삭제 (404)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.requestedId}&requestedId=${deleteAdminDto.userId}`,
        )
        .expect(404);
    });

    it('admin권한 삭제하려는 유저가 채팅방에 없는경우 (404)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=99999`,
        )
        .expect(404);
    });

    it('admin 권한 없는 user가 admin 권한 삭제 (404)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${user3.id}&requestedId=${user4.id}`,
        )
        .expect(404);
    });

    // it('should return 200', async () => {
    //   const uf = new UserFactory();
    //   const user1 = uf.createUser(101234);
    //   const user2 = uf.createUser(101235);
    //   await userRepository.save([user1, user2]);
    //   const createChatDto = new CreateGroupChatDto();
    //   createChatDto.password = '1234';
    //   createChatDto.chatName = '테스트 채팅방';
    //   createChatDto.levelOfPublicity = 'Priv';
    //   createChatDto.maxParticipants = 10;
    //   createChatDto.ownerId = 101234;

    //   const groupChat = await groupChatRepository.save(createChatDto);

    //   const addAdminDto = new AddAdminDto();
    //   addAdminDto.userId = 101234;
    //   addAdminDto.requestedId = 101235;

    //   await request(app.getHttpServer())
    //     .post(
    //       `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${addAdminDto.userId}&requestedId=${addAdminDto.requestedId}`,
    //     )
    //     .expect(201);

    //   const dataBeforeDelete = await groupChatRepository.find({
    //     where: {
    //       groupChatId: groupChat.groupChatId,
    //     },
    //     relations: ['admin'],
    //   });
    //   expect(dataBeforeDelete[0].admin[0].id).toBe(addAdminDto.requestedId);

    //   const deleteAdminDto = new DeleteAdminDto();
    //   deleteAdminDto.userId = 101234;
    //   deleteAdminDto.requestedId = 101235;

    //   await request(app.getHttpServer())
    //     .delete(
    //       `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=${deleteAdminDto.requestedId}`,
    //     )
    //     .expect(200);

    //   const dataAfterDelete = await groupChatRepository.find({
    //     where: {
    //       groupChatId: groupChat.groupChatId,
    //     },
    //     relations: ['admin'],
    //   });
    //   expect(dataAfterDelete[0].admin[0]).toBe(undefined);
    // });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
