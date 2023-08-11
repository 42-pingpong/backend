import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { appDatabase } from 'src/datasource/appdatabase';
import { testDatabase } from 'src/datasource/testDatabase';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { User } from 'src/entities/user/user.entity';
import { ChatFactory } from 'src/factory/chat.factory';
import { UserFactory } from 'src/factory/user.factory';
import { ChatModule } from 'src/restapi/chat/chat.module';
import { AddAdminDto } from 'src/restapi/chat/dto/add-admin.dto';
import { CreateGroupChatDto } from 'src/restapi/chat/dto/create-group-chat.dto';
import { DeleteAdminDto } from 'src/restapi/chat/dto/delete-admin.dto';
import { JoinGroupChatDto } from 'src/restapi/chat/dto/join-group-chat.dto';
import { UpdateGroupChatDto } from 'src/restapi/chat/dto/update-group-chat.dto';
import * as request from 'supertest';
import { DataSource, In, Repository } from 'typeorm';

describe('Chat', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let groupChatRepository: Repository<GroupChat>;
  let userRepository: Repository<User>;
  let userFactory: UserFactory;
  let chatFactory: ChatFactory;

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
    userFactory = new UserFactory();
    chatFactory = new ChatFactory();
  });

  describe('POST /api/chat/groupChat', () => {
    it('should return 201', async () => {
      const uf = new UserFactory();

      const user = uf.createUser(2000);
      await userRepository.save(user);

      const createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Prot';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = user.id;

      const response = await request(app.getHttpServer())
        .post('/chat/groupChat')
        .send(createChatDto);

      const result = await groupChatRepository.findOne({
        where: { groupChatId: response.body.groupChatId },
      });

      expect(result).toBeDefined();
      expect(response.status).toBe(201);

      await groupChatRepository.delete({
        groupChatId: response.body.groupChatId,
      });
      await userRepository.delete({ id: user.id });
    });

    it('초대와 함께 채팅방 생성', async () => {
      const uf = new UserFactory();

      const user1 = await userRepository.save(uf.createUser(1998));

      const user2 = await userRepository.save(uf.createUser(1999));

      const createChatDto = new CreateGroupChatDto();
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Prot';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = user1.id;
      createChatDto.participants = [user2.id];

      const res = await request(app.getHttpServer())
        .post('/chat/groupChat')
        .send(createChatDto);

      console.log(res.body);
      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
      expect(res.body.joinedUser.length).toBe(1);
      expect(res.body.curParticipants).toBe(2);
    });
  });

  describe('GET /api/chat/groupChat/:groupChatId', () => {
    // it.todo('GET /api/chat/groupChat/:groupChatId');
    it('should return 200', async () => {
      const uf = new UserFactory();
      const user = uf.createUser(2001);
      await userRepository.save(user);
      const createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Prot';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = user.id;

      const response = await request(app.getHttpServer())
        .post('/chat/groupChat')
        .send(createChatDto);

      expect(response.body).toBeDefined();
      expect(response.status).toBe(201);

      const response2 = await request(app.getHttpServer()).get(
        `/chat/groupChat/${response.body.groupChatId}`,
      );

      expect(response2.status).toBe(200);

      await groupChatRepository.delete({
        groupChatId: response.body.groupChatId,
      });
      await userRepository.delete({ id: user.id });
    });
  });

  describe('PATCH /api/chat/groupChat/:groupChatId', () => {
    // it.todo('PATCH /api/chat/groupChat/:groupChatId');
    it('should return 200', async () => {
      const uf = new UserFactory();
      const user = uf.createUser(2002);
      await userRepository.save(user);
      const createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Prot';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 2002;

      const response = await request(app.getHttpServer())
        .post('/chat/groupChat')
        .send(createChatDto);

      const updateChatDto = new UpdateGroupChatDto();
      updateChatDto.password = '4321';
      updateChatDto.levelOfPublicity = 'Pub';
      updateChatDto.maxParticipants = 20;

      const response2 = await request(app.getHttpServer())
        .patch(`/chat/groupChat/${response.body.groupChatId}`)
        .send(updateChatDto);

      expect(response2.status).toBe(200);

      await groupChatRepository.delete({
        groupChatId: response.body.groupChatId,
      });
      await userRepository.delete({ id: user.id });
    });
  });

  describe('POST /api/chat/groupChat/:groupChatId', () => {
    let groupChat: GroupChat;
    let createChatDto: CreateGroupChatDto;
    const uf = new UserFactory();
    let user1: User;
    let user2: User;
    const joinChatDto = new JoinGroupChatDto();

    beforeAll(async () => {
      user1 = await userRepository.save(uf.createUser(2003));
      user2 = await userRepository.save(uf.createUser(2004));
      createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Prot';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = user1.id;
      groupChat = await groupChatRepository.save(createChatDto);
      joinChatDto.userId = user2.id;
    });

    it('user1의 방에 user2가 참여', async () => {
      // user2가 방에 참여

      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}`)
        .query(joinChatDto);
      expect(res.status).toBe(201);

      const updateGroupChat = await request(app.getHttpServer()).get(
        `/chat/groupChat/${groupChat.groupChatId}`,
      ); // 방 정보 가져오기
      expect(updateGroupChat.body.curParticipants).toBe(2);

      const joinedUserList = await request(app.getHttpServer()).get(
        `/chat/groupChat/${groupChat.groupChatId}/userList`,
      );
      expect(joinedUserList.body.joinedUser[0].id).toBe(user2.id);

      await groupChatRepository.delete({
        groupChatId: groupChat.groupChatId,
      });
      await userRepository.delete({ id: user1.id });
      await userRepository.delete({ id: user2.id });
    });
  });

  describe('POST /api/chat/groupChat/:groupChatId/admin', () => {
    let groupChat: GroupChat;
    let createChatDto: CreateGroupChatDto;
    const uf = new UserFactory();
    let user1: User;
    let user2: User;
    let user3: User;
    let user4: User;
    const addAdminDto = new AddAdminDto();
    addAdminDto.userId = 2005; // owner(user1)
    addAdminDto.requestedId = 2006; // user(user2)

    beforeEach(async () => {
      user1 = await userRepository.save(uf.createUser(2005));
      user2 = await userRepository.save(uf.createUser(2006));
      user3 = await userRepository.save(uf.createUser(2007));
      user4 = await userRepository.save(uf.createUser(2008));
      createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Prot';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 2005;
      groupChat = await groupChatRepository.save(createChatDto);
      // user2가 방에 참여
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}`)
        .query({ userId: 2006 });

      // user3가 방에 참여
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}`)
        .query({ userId: 2007 });

      // user4가 방에 참여
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}`)
        .query({ userId: 2008 });
    });

    afterEach(async () => {
      await groupChatRepository.delete({
        groupChatId: groupChat.groupChatId,
      });
      await userRepository.delete({ id: user1.id });
      await userRepository.delete({ id: user2.id });
      await userRepository.delete({ id: user3.id });
      await userRepository.delete({ id: user4.id });
    });

    /**
     * 정상 실행 (201)
     * 1. owner -> (user -> admin) 정상 추가 + joinedUser 삭제
     * 2. admin -> (user -> admin) 권한 추가 + joinedUser 삭제
     */
    it('user1(owner)이 (user2 -> admin)으로 정상 추가 (201)', async () => {
      addAdminDto.userId = 2005;
      addAdminDto.requestedId = 2006;
      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto);

      const updatedGroupChat = await groupChatRepository.findOne({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin', 'joinedUser'],
      });
      expect(updatedGroupChat.admin[0].id).toBe(addAdminDto.requestedId);
      expect(updatedGroupChat.joinedUser.length).toBe(2);
    });

    it('user2(admin)이 (user3 -> admin)으로 권한 추가 (201)', async () => {
      // user1이 user2를 admin으로 추가
      addAdminDto.userId = 2005;
      addAdminDto.requestedId = 2006;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto);

      // user2가 user3를 admin으로 추가
      addAdminDto.userId = 2006;
      addAdminDto.requestedId = 2007;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(201);

      const updatedGroupChat = await groupChatRepository.findOne({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin', 'joinedUser'],
      });
      expect(updatedGroupChat.admin.length).toBe(2);
      expect(updatedGroupChat.curParticipants).toBe(4);
    });

    /**
     * 에러 발생
     * 1. 존재하지 않는 채팅방 (404) : Not Found
     * 2. owner -> (admin -> admin) 권한 이미 보유 (409) : Conflict
     * 3. admin -> (owner -> admin) 권한 추가 (403) : Forbidden
     * 4. owner -> (user 채팅방 X) (404) : Not Found
     * 5. admin -> (user 채팅방 X) (404) : Not Found
     * 6. owner -> (owner -> admin) (403) : Forbidden
     * 7. admin -> (admin -> admin) (409) : Conflict
     */

    it('존재하지 않는 채팅방 (404)', async () => {
      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/9999999/admin?userId=${addAdminDto.userId}&requestedId=${addAdminDto.requestedId}`,
        )
        .send(addAdminDto)
        .expect(404);
    });

    it('user1(owner)이 admin user2를 admin으로 추가/ user2가 권한 이미 보유 (409)', async () => {
      addAdminDto.userId = 2005;
      addAdminDto.requestedId = 2006;

      // user1이 user2를 admin으로 추가
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(201);

      // 1번 더 추가
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(409);
      const updatedGroupChat = await groupChatRepository.findOne({
        where: {
          groupChatId: groupChat.groupChatId,
        },
        relations: ['admin', 'joinedUser'],
      });
      expect(updatedGroupChat.admin.length).toBe(1);
      expect(updatedGroupChat.curParticipants).toBe(4);
      expect(updatedGroupChat.joinedUser.length).toBe(2);
    });

    it('user2(admin)이 user1(owner)를 admin 권한 추가 (403)', async () => {
      // user2를 admin으로 추가
      addAdminDto.userId = 2005;
      addAdminDto.requestedId = 2006;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(201);

      // user1(owner)를 admin으로 추가
      addAdminDto.userId = 2006;
      addAdminDto.requestedId = 2005;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(403);
    });

    it('owner가 채팅방에 없는 유저를 admin으로 추가 (404)', async () => {
      addAdminDto.userId = 2005;
      addAdminDto.requestedId = 99999;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(404);
    });

    it('admin이 채팅방에 없는 유저를 admin으로 추가 (404)', async () => {
      addAdminDto.userId = 2005;
      addAdminDto.requestedId = 2006;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto);

      addAdminDto.userId = 2006;
      addAdminDto.requestedId = 99999;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(404);
    });

    it('owner가 owner를 admin으로 추가 (404)', async () => {
      addAdminDto.userId = 2005;
      addAdminDto.requestedId = 2005;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(403); // Forbidden
    });

    it('user2(admin)이 user3(admin)을 admin으로 추가 (409)', async () => {
      addAdminDto.userId = 2005;
      addAdminDto.requestedId = 2006;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto);

      addAdminDto.userId = 2006;
      addAdminDto.requestedId = 2007;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto);

      // admin이 admin을 admin으로 추가
      addAdminDto.userId = 2006;
      addAdminDto.requestedId = 2007;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}/admin`)
        .query(addAdminDto)
        .expect(409);
    });
  });

  describe('DELETE /api/chat/groupChat/:groupChatId/admin', () => {
    let groupChat: GroupChat;
    let createChatDto: CreateGroupChatDto;
    const uf = new UserFactory();
    let user1: User;
    let user2: User;
    let user3: User;
    let user4: User;
    const deleteAdminDto = new DeleteAdminDto();
    deleteAdminDto.userId = 2100; // owner(user1)
    deleteAdminDto.requestedId = 2101; // user(user2)

    beforeAll(async () => {
      user1 = await userRepository.save(uf.createUser(2100));
      user2 = await userRepository.save(uf.createUser(2101));
      user3 = await userRepository.save(uf.createUser(2102));
      user4 = await userRepository.save(uf.createUser(2103));
      createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Prot';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = 2100;
      groupChat = await groupChatRepository.save(createChatDto);
    });

    beforeEach(async () => {
      // await userRepository.delete({});
      // await groupChatRepository.delete({});
    });

    afterAll(async () => {
      // await groupChatRepository.delete({});
    });

    /**
     * 정상 실행 (200)
     * 1. owner -> (admin -> user) 정상 삭제 + joinedUser 추가
     */

    it('owner -> admin 권한 삭제 (200)', async () => {
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
        relations: ['admin', 'joinedUser'],
      });
      expect(updatedGroupChat[0].admin.length).toBe(0);
      expect(updatedGroupChat[0].joinedUser[0].id).toBe(
        deleteAdminDto.requestedId,
      );
    });

    // /**
    //  * 에러 발생
    //  * 1. 존재하지 않는 채팅방 (404) : Not Found
    //  * 2. owner -> (owner -> user) 삭제 (404) : Not Found
    //  * 3. admin -> (owner -> user) 삭제 (404) : Not Found
    //  * 4. admin -> (admin -> user) 삭제 (403) : Forbidden
    //  * 5. owner -> (user -> user) 삭제 (404) : Not Found
    //  * 6. admin -> (user -> user) 삭제 (404) : Not Found
    //  * 7. onwer -> (user 채팅방 X) (404) : Not Found
    //  * 8. admin -> (user 채팅방 X) (404) : Not Found
    //  */

    it('존재하지 않는 채팅방 (404)', async () => {
      await request(app.getHttpServer())
        .post(
          `/chat/groupChat/9999999/admin?userId=${deleteAdminDto.userId}&requestedId=${deleteAdminDto.requestedId}`,
        )
        .expect(404);
    });

    it('owner -> (owner -> user) 삭제 (404)', async () => {
      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=${deleteAdminDto.userId}`,
        )
        .expect(404);
    });

    it('admin -> (owner -> user) 삭제 (404)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.requestedId}&requestedId=${deleteAdminDto.userId}`,
        )
        .expect(404);
    });

    it('admin -> (admin -> user) 삭제 (403)', async () => {
      groupChat.admin = [user2, user3];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.requestedId}&requestedId=${user3.id}`,
        )
        .expect(403);
    });

    it('owner -> (user -> user) (404)', async () => {
      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=${user3.id}`,
        )
        .expect(404);
    });

    it('admin -> (user -> user) (404)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.requestedId}&requestedId=${user3.id}`,
        )
        .expect(404);
    });

    it('onwer -> (user 채팅방 X) (404)', async () => {
      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.userId}&requestedId=9999999`,
        )
        .expect(404);
    });

    it('admin -> (user 채팅방 X) (404)', async () => {
      groupChat.admin = [user2];
      await groupChatRepository.save(groupChat);

      await request(app.getHttpServer())
        .delete(
          `/chat/groupChat/${groupChat.groupChatId}/admin?userId=${deleteAdminDto.requestedId}&requestedId=9999999`,
        )
        .expect(404);
    });
  });

  /**
   * user 2200~
   * */
  describe('GET /chat/groupChatList/:userId', () => {
    let user2200: User;
    let user2201: User;
    let user2202: User;
    let user2203: User;
    let groupChat2200: GroupChat;

    beforeAll(async () => {
      const joinGroupChatDto = new JoinGroupChatDto();
      user2200 = await userRepository.save(userFactory.createUser(2200));
      user2201 = await userRepository.save(userFactory.createUser(2201));
      user2202 = await userRepository.save(userFactory.createUser(2202));
      user2203 = await userRepository.save(userFactory.createUser(2203));
      groupChat2200 = await groupChatRepository.save(
        chatFactory.createPubChat(user2200.id, 2200),
      );

      joinGroupChatDto.userId = user2201.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat2200.groupChatId}`)
        .query(joinGroupChatDto);

      joinGroupChatDto.userId = user2202.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat2200.groupChatId}`)
        .query(joinGroupChatDto);

      joinGroupChatDto.userId = user2203.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat2200.groupChatId}`)
        .query(joinGroupChatDto);
      const addAdminDto = new AddAdminDto();
      addAdminDto.userId = user2200.id;
      addAdminDto.requestedId = user2201.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat2200.groupChatId}/admin`)
        .query(addAdminDto);
    });
    afterAll(async () => {
      await groupChatRepository.delete({
        groupChatId: groupChat2200.groupChatId,
      });
      await userRepository.delete({
        id: In([user2200.id, user2201.id, user2202.id, user2203.id]),
      });
    });

    it('owner로 참여중인 채팅방', async () => {
      const res = await request(app.getHttpServer())
        .get(`/chat/groupChatList/${user2200.id}`)
        .expect(200);

      expect(res.body[0].owner.id).toBe(user2200.id);
    });

    it('어드민 유저(2201)로 참여중인 채팅방', async () => {
      const res = await request(app.getHttpServer())
        .get(`/chat/groupChatList/${user2201.id}`)
        .expect(200);

      expect(res.body[0].admin[0].id).toBe(user2201.id);
    });

    it('일반 유저(2202)로 참여중인 채팅방', async () => {
      const res = await request(app.getHttpServer())
        .get(`/chat/groupChatList/${user2202.id}`)
        .expect(200);

      console.log(res.body[0].joinedUser);
      expect(res.body[0].joinedUser[0].id).toBe(user2202.id);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
