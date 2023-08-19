import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { appDatabase } from 'src/datasource/appdatabase';
import { testDatabase } from 'src/datasource/testDatabase';
import { DirectMessage } from 'src/entities/chat/directMessage.entity';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { GroupChatMessage } from 'src/entities/chat/groupChatMessage.entity';
import { MessageInfo } from 'src/entities/chat/messageInfo.entity';
import { BlockUserList } from 'src/entities/user/blockUserList.entity';
import { User } from 'src/entities/user/user.entity';
import { ChatFactory } from 'src/factory/chat.factory';
import { UserFactory } from 'src/factory/user.factory';
import { ChatModule } from 'src/restapi/chat/chat.module';
import { AddAdminDto } from 'src/restapi/chat/dto/add-admin.dto';
import { CreateGroupChatDto } from 'src/restapi/chat/dto/create-group-chat.dto';
import { DeleteAdminDto } from 'src/restapi/chat/dto/delete-admin.dto';
import { JoinGroupChatDto } from 'src/restapi/chat/dto/join-group-chat.dto';
import { UpdateGroupChatDto } from 'src/restapi/chat/dto/update-group-chat.dto';
import { BlockRequestDto } from 'src/restapi/chat/request/block.request.dto';
import { DirectMessageDto } from 'src/restapi/chat/request/DirectMessage.dto';
import { GetDirectMessageDto } from 'src/restapi/chat/request/getDirectMessage.dto';
import { GetGroupMessageDto } from 'src/restapi/chat/request/getGroupMessage.dto';
import { GroupChatMessageDto } from 'src/restapi/chat/request/groupChatMessage.dto';
import { UnBlockRequestDto } from 'src/restapi/chat/request/unBlock.request.dto';
import * as request from 'supertest';
import { DataSource, In, Repository } from 'typeorm';
import { MuteRequestDto } from '../../src/restapi/chat/request/mute.dto';
import { MutedUserJoin } from '../../src/entities/chat/mutedUserJoin.entity';
import { BanDto } from '../../src/restapi/chat/dto/ban.dto';
import { GetBanMuteListDto } from '../../src/restapi/chat/request/getBanMuteList.dto';

describe('Chat', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let groupChatRepository: Repository<GroupChat>;
  let userRepository: Repository<User>;
  let groupMessageRepository: Repository<GroupChatMessage>;
  let dmRepository: Repository<DirectMessage>;
  let msgInfoRepository: Repository<MessageInfo>;
  let blockRepository: Repository<BlockUserList>;
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
      .useModule(
        TypeOrmModule.forFeature([
          GroupChat,
          User,
          GroupChatMessage,
          DirectMessage,
          MessageInfo,
          BlockUserList,
        ]),
      )
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
    groupMessageRepository = dataSource.getRepository(GroupChatMessage);
    dmRepository = dataSource.getRepository(DirectMessage);
    msgInfoRepository = dataSource.getRepository(MessageInfo);
    blockRepository = dataSource.getRepository(BlockUserList);
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

      console.log(result);

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
      expect(res.status).toBe(403);

      joinChatDto.password = createChatDto.password;
      const res2 = await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat.groupChatId}`)
        .query(joinChatDto);

      expect(res2.status).toBe(201);

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
      createChatDto.levelOfPublicity = 'Pub';
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
        relations: {
          admin: true,
          joinedUser: true,
        },
      });

      expect(res.status).toBe(201);
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
    // let user4: User;
    const deleteAdminDto = new DeleteAdminDto();
    deleteAdminDto.userId = 2100; // owner(user1)
    deleteAdminDto.requestedId = 2101; // user(user2)

    beforeAll(async () => {
      user1 = await userRepository.save(uf.createUser(2100));
      user2 = await userRepository.save(uf.createUser(2101));
      user3 = await userRepository.save(uf.createUser(2102));
      // user4 = await userRepository.save(uf.createUser(2103));
      createChatDto = new CreateGroupChatDto();
      createChatDto.password = '1234';
      createChatDto.chatName = '테스트 채팅방';
      createChatDto.levelOfPublicity = 'Prot';
      createChatDto.maxParticipants = 10;
      createChatDto.ownerId = user1.id;
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

      expect(res.body[0].joinedUser[0].id).toBe(user2202.id);
    });
  });

  /**
   * user 2210~
   * */
  describe('POST /chat/groupChat/:groupChatId/ban', () => {
    it.todo('owner가 admin을 ban');
    it.todo('owner가 user를 ban');
    it.todo('admin이 user를 ban');
    it.todo('admin이 admin을 ban');
  });

  /**
   * user 2220~
   * */
  describe('POST /chat/groupChat/:groupChatId/unban', () => {
    it.todo('owner가 admin을 ban');
    it.todo('owner가 user를 ban');
    it.todo('admin이 user를 ban');
    it.todo('admin이 admin을 ban');
  });

  /**
   * user 2230~
   * */
  describe('POST /chat/groupChat/messages', () => {
    let user2230: User;
    let user2231: User;
    let user2232: User;
    let user2233: User;

    let groupChat2230: GroupChat;

    beforeAll(async () => {
      user2230 = await userRepository.save(userFactory.createUser(2230));
      user2231 = await userRepository.save(userFactory.createUser(2231));
      user2232 = await userRepository.save(userFactory.createUser(2232));
      user2233 = await userRepository.save(userFactory.createUser(2233));

      const createChatDto = new CreateGroupChatDto();
      createChatDto.levelOfPublicity = 'Pub';
      createChatDto.chatName = 'test';
      createChatDto.ownerId = user2230.id;
      createChatDto.maxParticipants = 10;
      createChatDto.participants = [user2231.id, user2232.id, user2233.id];

      groupChat2230 = (
        await request(app.getHttpServer())
          .post('/chat/groupChat')
          .send(createChatDto)
      ).body;
    });

    afterAll(async () => {
      await groupMessageRepository.delete({
        receivedGroupChatId: groupChat2230.groupChatId,
      });
      await msgInfoRepository.delete({
        senderId: In([user2230.id, user2231.id, user2232.id, user2233.id]),
      });

      await groupChatRepository.delete({
        groupChatId: groupChat2230.groupChatId,
      });
      await userRepository.delete({
        id: In([user2230.id, user2231.id, user2232.id, user2233.id]),
      });
    });

    it('owner가 메세지 보내기', async () => {
      const createMessageDto = new GroupChatMessageDto();
      createMessageDto.senderId = user2230.id;
      createMessageDto.receivedGroupChatId = groupChat2230.groupChatId;
      createMessageDto.message = 'test';

      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);

      expect(res.status).toBe(201);
      expect(res.body.messageInfo.sender.id).toBe(user2230.id);
    });

    it('admin이 메세지 보내기', async () => {
      //2231을 admin으로 만들기
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat2230.groupChatId}/admin`)
        .query({ userId: user2230.id, requestedId: user2231.id });

      const createMessageDto = new GroupChatMessageDto();
      createMessageDto.senderId = user2231.id;
      createMessageDto.receivedGroupChatId = groupChat2230.groupChatId;
      createMessageDto.message = 'test';

      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);

      expect(res.status).toBe(201);
      expect(res.body.messageInfo.sender.id).toBe(user2231.id);
    });

    it('user가 메세지 보내기', async () => {
      const createMessageDto = new GroupChatMessageDto();
      createMessageDto.senderId = user2232.id;
      createMessageDto.receivedGroupChatId = groupChat2230.groupChatId;
      createMessageDto.message = 'test';

      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);

      expect(res.status).toBe(201);
      expect(res.body.messageInfo.sender.id).toBe(user2232.id);
    });
  });

  /**
   * user 2240
   * */
  describe('POST /chat/messages', () => {
    let user2240: User;
    let user2241: User;
    let user2242: User;
    let user2243: User;

    beforeAll(async () => {
      user2240 = await userRepository.save(userFactory.createUser(2240));
      user2241 = await userRepository.save(userFactory.createUser(2241));
      user2242 = await userRepository.save(userFactory.createUser(2242));
      user2243 = await userRepository.save(userFactory.createUser(2243));
    });

    afterAll(async () => {
      await dmRepository.delete({
        receivedUserId: In([
          user2240.id,
          user2241.id,
          user2242.id,
          user2243.id,
        ]),
      });

      await msgInfoRepository.delete({
        senderId: In([user2240.id, user2241.id, user2242.id, user2243.id]),
      });

      await userRepository.delete({
        id: In([user2240.id, user2241.id, user2242.id, user2243.id]),
      });
    });

    it('user2240이 메세지 보내기', async () => {
      const dmDto = new DirectMessageDto();

      dmDto.senderId = user2240.id;
      dmDto.receiverId = user2241.id;
      dmDto.message = 'test';

      const res = await request(app.getHttpServer())
        .post(`/chat/messages`)
        .send(dmDto);

      expect(res.status).toBe(201);
      expect(res.body.messageInfo.sender.id).toBe(user2240.id);
      expect(res.body.receivedUserId).toBe(user2241.id);
    });

    it('user2241이 메세지 보내기', async () => {
      const dmDto = new DirectMessageDto();

      dmDto.senderId = user2241.id;
      dmDto.receiverId = user2240.id;
      dmDto.message = 'test';

      const res = await request(app.getHttpServer())
        .post(`/chat/messages`)
        .send(dmDto);

      expect(res.status).toBe(201);
      expect(res.body.messageInfo.sender.id).toBe(user2241.id);
      expect(res.body.receivedUserId).toBe(user2240.id);
    });
  });

  describe('GET /directMessages', () => {
    let user2250: User;
    let user2251: User;
    let user2252: User;
    let user2253: User;

    beforeAll(async () => {
      user2250 = await userRepository.save(userFactory.createUser(2250));
      user2251 = await userRepository.save(userFactory.createUser(2251));
      user2252 = await userRepository.save(userFactory.createUser(2252));
      user2253 = await userRepository.save(userFactory.createUser(2253));
    });

    afterAll(async () => {
      await dmRepository.delete({});
      await msgInfoRepository.delete({});
      await userRepository.delete({
        id: In([user2250.id, user2251.id, user2252.id, user2253.id]),
      });
    });

    it('user2250이 user2251에게 메세지 보내기', async () => {
      const dmDto = new DirectMessageDto();

      dmDto.senderId = user2250.id;
      dmDto.receiverId = user2251.id;
      dmDto.message = 'message from 2250 to 2251';
      await request(app.getHttpServer()).post(`/chat/messages`).send(dmDto);

      dmDto.senderId = user2251.id;
      dmDto.receiverId = user2250.id;
      dmDto.message = 'message from 2251 to 2250';
      await request(app.getHttpServer()).post(`/chat/messages`).send(dmDto);

      dmDto.senderId = user2250.id;
      dmDto.receiverId = user2252.id;
      dmDto.message = 'message from 2250 to 2252';
      await request(app.getHttpServer()).post(`/chat/messages`).send(dmDto);

      /**
       * user2250이 user2251에게 보낸 메세지들을 가져오기
       * */
      const getDmDto = new GetDirectMessageDto();
      getDmDto.userId = user2250.id;
      getDmDto.targetId = user2251.id;
      const dms = await request(app.getHttpServer())
        .get('/chat/directMessages')
        .query(getDmDto);

      expect(dms.status).toBe(200);
      expect(dms.body.length).toBe(2);
    });
  });

  describe('GET /groupMessages', () => {
    let user2260: User;
    let user2261: User;
    let user2262: User;
    let user2263: User;
    let groupChat2260: GroupChat;

    beforeAll(async () => {
      user2260 = await userRepository.save(userFactory.createUser(2260));
      user2261 = await userRepository.save(userFactory.createUser(2261));
      user2262 = await userRepository.save(userFactory.createUser(2262));
      user2263 = await userRepository.save(userFactory.createUser(2263));

      // 2260이 owner인 groupChat 만들기
      const createChatDto = new CreateGroupChatDto();
      createChatDto.levelOfPublicity = 'Pub';
      createChatDto.chatName = 'test';
      createChatDto.ownerId = user2260.id;
      createChatDto.maxParticipants = 10;
      createChatDto.participants = [user2261.id, user2262.id, user2263.id];

      groupChat2260 = (
        await request(app.getHttpServer())
          .post('/chat/groupChat')
          .send(createChatDto)
      ).body;

      //2260이 message 보내기
      const createMessageDto = new GroupChatMessageDto();
      createMessageDto.senderId = user2260.id;
      createMessageDto.receivedGroupChatId = groupChat2260.groupChatId;
      createMessageDto.message = 'message from owner 1';
      await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);

      createMessageDto.message = 'message from owner 2';
      await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);

      //2261을 admin으로 만들기
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat2260.groupChatId}/admin`)
        .query({ userId: user2260.id, requestedId: user2261.id });

      //admin이 message 보내기
      createMessageDto.senderId = user2261.id;
      createMessageDto.receivedGroupChatId = groupChat2260.groupChatId;
      createMessageDto.message = 'message from admin 1';
      await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);

      createMessageDto.message = 'message from admin 2';
      await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);

      //2262가 message 보내기
      createMessageDto.senderId = user2262.id;
      createMessageDto.receivedGroupChatId = groupChat2260.groupChatId;
      createMessageDto.message = 'message from 2262 1';
      await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);

      createMessageDto.message = 'message from 2262 2';
      await request(app.getHttpServer())
        .post(`/chat/groupChat/messages/send`)
        .send(createMessageDto);
    });

    afterAll(async () => {
      await groupMessageRepository.delete({});
      await msgInfoRepository.delete({});
      await groupChatRepository.delete(groupChat2260.groupChatId);
      await userRepository.delete(user2260.id);
      await userRepository.delete(user2261.id);
      await userRepository.delete(user2262.id);
      await userRepository.delete(user2263.id);
    });

    it('user2260이 groupChat2260에서 메세지 가져오기', async () => {
      const qr = new GetGroupMessageDto();
      qr.userId = user2260.id;
      qr.groupChatId = groupChat2260.groupChatId;

      const res = await request(app.getHttpServer())
        .get('/chat/groupMessages')
        .query(qr);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(6);
    });

    it('user2261이 groupChat2260에서 메세지 가져오기', async () => {
      const qr = new GetGroupMessageDto();
      qr.userId = user2261.id;
      qr.groupChatId = groupChat2260.groupChatId;

      const res = await request(app.getHttpServer())
        .get('/chat/groupMessages')
        .query(qr);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(6);
    });

    it('user2262가 groupChat2260에서 메세지 가져오기', async () => {
      const qr = new GetGroupMessageDto();
      qr.userId = user2262.id;
      qr.groupChatId = groupChat2260.groupChatId;

      const res = await request(app.getHttpServer())
        .get('/chat/groupMessages')
        .query(qr);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(6);
    });
  });

  describe('POST /block , /unBlock', () => {
    let user2270: User;
    let user2271: User;
    let user2272: User;
    let user2273: User;

    beforeAll(async () => {
      user2270 = await userRepository.save(userFactory.createUser(2270));
      user2271 = await userRepository.save(userFactory.createUser(2271));
      user2272 = await userRepository.save(userFactory.createUser(2272));
      user2273 = await userRepository.save(userFactory.createUser(2273));
    });

    afterAll(async () => {
      await blockRepository.delete({
        userId: In([user2270.id, user2271.id, user2272.id, user2273.id]),
      });

      await userRepository.delete({
        id: In([user2270.id, user2271.id, user2272.id, user2273.id]),
      });
    });

    it('user2270이 user2271을 block 하기', async () => {
      const blockDto = new BlockRequestDto();
      blockDto.userId = user2270.id;
      blockDto.blockedUserId = user2271.id;
      await request(app.getHttpServer()).post(`/chat/block`).send(blockDto);

      const block = await blockRepository.findOne({
        where: { userId: user2270.id, blockedUserId: user2271.id },
      });
      expect(block).toBeDefined();
      expect(block.blockedUserId).toBe(user2271.id);

      //1번더
      const res = await request(app.getHttpServer())
        .post(`/chat/block`)
        .send(blockDto);
      expect(res.status).toBe(403);

      //user2270이 user2271을 unblock 하기
      const unBlockDto = new UnBlockRequestDto();
      unBlockDto.userId = user2270.id;
      unBlockDto.unBlockedUserId = user2271.id;

      const res2 = await request(app.getHttpServer())
        .delete(`/chat/unBlock`)
        .send(unBlockDto);
      expect(res2.status).toBe(200);
    });
  });

  /**
   * user 2280~
   * */
  describe('POST /chat/groupChat/mute(unMute)/:groupChatId', () => {
    let user2280: User;
    let user2281: User;
    let user2282: User;
    let user2283: User;
    let groupChat2280: GroupChat;

    beforeAll(async () => {
      user2280 = await userRepository.save(userFactory.createUser(2280));
      user2281 = await userRepository.save(userFactory.createUser(2281));
      user2282 = await userRepository.save(userFactory.createUser(2282));
      user2283 = await userRepository.save(userFactory.createUser(2283));

      const createChatDto = new CreateGroupChatDto();
      createChatDto.levelOfPublicity = 'Pub';
      createChatDto.chatName = 'test';
      createChatDto.ownerId = user2280.id;
      createChatDto.maxParticipants = 10;
      createChatDto.participants = [user2281.id, user2282.id, user2283.id];

      groupChat2280 = (
        await request(app.getHttpServer())
          .post('/chat/groupChat')
          .send(createChatDto)
      ).body;

      const addAdminDto = new AddAdminDto();
      addAdminDto.userId = user2280.id;
      addAdminDto.requestedId = user2281.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat2280.groupChatId}/admin`)
        .query(addAdminDto);

      addAdminDto.userId = user2280.id;
      addAdminDto.requestedId = user2283.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat2280.groupChatId}/admin`)
        .query(addAdminDto);
    });

    afterAll(async () => {
      await groupChatRepository.manager.getRepository(MutedUserJoin).delete({
        mutedGroupId: groupChat2280.groupChatId,
      });
      await groupChatRepository.delete({
        groupChatId: groupChat2280.groupChatId,
      });
      await userRepository.delete({
        id: In([user2280.id, user2281.id, user2282.id, user2283.id]),
      });
    });

    it('owner가 user를 10초간 mute 🅾️', async () => {
      const muteDto = new MuteRequestDto();
      muteDto.userId = user2282.id;
      muteDto.requestUserId = user2280.id;
      muteDto.unit = 's';
      muteDto.time = 10;

      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/mute/${groupChat2280.groupChatId}`)
        .send(muteDto);

      await groupChatRepository.findOne({
        where: { groupChatId: groupChat2280.groupChatId },
        relations: {
          mutedUsers: true,
        },
        select: {
          mutedUsers: true,
        },
      });

      expect(res.status).toBe(201);
    });
    it('admin이 user를 mute 🅾️', async () => {
      const muteDto = new MuteRequestDto();
      muteDto.userId = user2282.id;
      muteDto.requestUserId = user2281.id;
      muteDto.unit = 's';
      muteDto.time = 10;

      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/mute/${groupChat2280.groupChatId}`)
        .send(muteDto);

      expect(res.status).toBe(201);
    });
    it('owner가 admin을 mute ❌', async () => {
      const muteDto = new MuteRequestDto();
      muteDto.userId = user2281.id;
      muteDto.requestUserId = user2280.id;
      muteDto.unit = 's';
      muteDto.time = 10;

      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/mute/${groupChat2280.groupChatId}`)
        .send(muteDto);

      expect(res.status).toBe(404);
    });
    it('admin이 admin을 mute ❌', async () => {
      const muteDto = new MuteRequestDto();
      muteDto.userId = user2283.id;
      muteDto.requestUserId = user2281.id;
      muteDto.unit = 's';
      muteDto.time = 10;

      const res = await request(app.getHttpServer())
        .post(`/chat/groupChat/mute/${groupChat2280.groupChatId}`)
        .send(muteDto);

      expect(res.status).toBe(404);
    });
  });

  /**
   * user 3000
   * */
  describe('GET /chat/groupChat/:groupChatId/banList', () => {
    let user3000: User;
    let user3001: User;
    let user3002: User;
    let user3003: User;
    let groupChat3000: GroupChat;

    let bannedUser3004: User;
    let bannedUser3005: User;
    let bannedUser3006: User;

    beforeAll(async () => {
      user3000 = await userRepository.save(userFactory.createUser(3000));
      user3001 = await userRepository.save(userFactory.createUser(3001));
      user3002 = await userRepository.save(userFactory.createUser(3002));
      user3003 = await userRepository.save(userFactory.createUser(3003));
      bannedUser3004 = await userRepository.save(userFactory.createUser(3004));
      bannedUser3005 = await userRepository.save(userFactory.createUser(3005));
      bannedUser3006 = await userRepository.save(userFactory.createUser(3006));

      const createChatDto = new CreateGroupChatDto();
      createChatDto.levelOfPublicity = 'Pub';
      createChatDto.chatName = 'test';
      createChatDto.ownerId = user3000.id;
      createChatDto.maxParticipants = 10;
      createChatDto.participants = [
        user3001.id,
        user3002.id,
        user3003.id,
        bannedUser3004.id,
        bannedUser3005.id,
        bannedUser3006.id,
      ];

      groupChat3000 = (
        await request(app.getHttpServer())
          .post('/chat/groupChat')
          .send(createChatDto)
      ).body;

      const addAdminDto = new AddAdminDto();
      addAdminDto.userId = user3000.id;
      addAdminDto.requestedId = user3001.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat3000.groupChatId}/admin`)
        .query(addAdminDto);

      addAdminDto.userId = user3000.id;
      addAdminDto.requestedId = user3003.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat3000.groupChatId}/admin`)
        .query(addAdminDto);

      const banDto = new BanDto();
      banDto.userId = user3000.id;
      banDto.bannedId = bannedUser3004.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat3000.groupChatId}/ban`)
        .send(banDto);

      banDto.bannedId = bannedUser3005.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat3000.groupChatId}/ban`)
        .send(banDto);

      banDto.bannedId = bannedUser3006.id;
      await request(app.getHttpServer())
        .post(`/chat/groupChat/${groupChat3000.groupChatId}/ban`)
        .send(banDto);

      const muteDto = new MuteRequestDto();
      muteDto.requestUserId = user3000.id;
      muteDto.userId = user3002.id;
      muteDto.unit = 's';
      muteDto.time = 10;

      await request(app.getHttpServer())
        .post(`/chat/groupChat/mute/${groupChat3000.groupChatId}`)
        .send(muteDto);
    });

    afterAll(async () => {
      await groupChatRepository.manager.getRepository(MutedUserJoin).delete({
        mutedGroupId: groupChat3000.groupChatId,
      });
      await groupChatRepository.delete({
        groupChatId: groupChat3000.groupChatId,
      });
      await userRepository.delete({
        id: In([user3000.id, user3001.id, user3002.id, user3003.id]),
      });
    });

    it('By Owner ', async () => {
      const dto = new GetBanMuteListDto();
      dto.userId = user3000.id;

      const res = await request(app.getHttpServer())
        .get(`/chat/groupChat/${groupChat3000.groupChatId}/banMuteList`)
        .query(dto);
      console.log(res.body);
      console.log(res.body[0].bannedUsers);
      console.log(res.body[0].mutedUsers);
      expect(res.body[0].bannedUsers.length).toBe(3);
      expect(res.body[0].mutedUsers.length).toBe(1);
    });
    // it.todo('By Admin ', async () => {});
    // it.todo('By Joined User Should Be Forbidden', async () => {});
  });

  /**
   * user 3010
   * */
  describe('GET /chat/groupChat/:groupChatId/muteList', () => {});

  /**
   * user 3010
   * */
  describe('GET /chat/groupChat/:groupChatId/muteOffset', () => {});

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
