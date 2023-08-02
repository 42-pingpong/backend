import { INestApplication, ValidationPipe } from '@nestjs/common';
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
    /**
     * 1. 성공
     * */

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
    });
  });

  describe('DELETE /api/chat/groupChat/:groupChatId/admin', () => {
    it('DELETE /api/chat/groupChat/:groupChatId/admin', async () => {
      const uf = new UserFactory();
      //새로운 오너 생성
      const user1 = uf.createUser(1012345);
      await userRepository.save(user1);

      //새로운 그룹챗 생성
      const newGroupChat = new CreateGroupChatDto();
      newGroupChat.chatName = 'testGroupChat';
      newGroupChat.password = '1234';
      newGroupChat.levelOfPublicity = 'Pub';
      newGroupChat.maxParticipants = 10;
      newGroupChat.ownerId = 1012345;
      let groupChat: GroupChat = await groupChatRepository.save(newGroupChat);

      //새로운 어드민 생성
      const adminUserDto = uf.createUser(1012346);
      const adminUser = await userRepository.save(adminUserDto);

      //그룹챗에 어드민 추가
      groupChat = await groupChatRepository.findOne({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });

      groupChat.admin.push(adminUser);
      await groupChatRepository.save(groupChat);

      //정상 추가 확인
      groupChat = await groupChatRepository.findOne({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });

      expect(groupChat.admin.length).toBe(1);

      //DeleteAdminDto 생성
      const deleteAdminDto = new DeleteAdminDto();
      deleteAdminDto.userId = 1012345;
      deleteAdminDto.requestedId = 1012346;

      //삭제 요청
      const response = await request(app.getHttpServer()).delete(
        `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=${deleteAdminDto.requestedId}`,
      );

      //삭제 확인
      expect(response.status).toBe(200);

      //삭제 확인
      const data = await groupChatRepository.find({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin'],
      });

      console.log(data);

      expect(data[0].admin.length).toBe(0);
    });
  });

  describe('GET /api/chat/groupChat/:groupChatId', () => {
    it.todo('GET /api/chat/groupChat/:groupChatId');
  });

  describe('PATCH /api/chat/groupChat/:groupChatId', () => {
    it.todo('PATCH /api/chat/groupChat/:groupChatId');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
