import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { appDatabase } from 'src/datasource/appdatabase';
import { testDatabase } from 'src/datasource/testDatabase';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { ChatModule } from 'src/restapi/chat/chat.module';
import { CreateGroupChatDto } from 'src/restapi/chat/dto/create-group-chat.dto';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { UserFactory } from 'test/user/user.factory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.entity';

describe('Chat', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let groupChatRepository: any;
  let userRepository: any;

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
      console.log(result);
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
