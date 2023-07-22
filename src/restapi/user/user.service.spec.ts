import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/entities/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  const existingUser = new User();
  const createUserDto: CreateUserDto = new CreateUserDto();

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        UserService,
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
    repository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * create
   * */
  describe('create', () => {
    /**
     * create - success
     * */
    it('create - success', async () => {
      createUserDto.id = 1;
      const newUser: User = new User();
      newUser.id = createUserDto.id;

      repository.save = jest.fn().mockResolvedValue(newUser);

      expect(await service.create(createUserDto)).toBeDefined();
      expect((await service.create(createUserDto)).id).toEqual(
        createUserDto.id,
      );
    });
  });

  describe('findOne', () => {
    /**
     * findOne - success
     * */
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('success', async () => {
      existingUser.id = 1;

      jest.spyOn(repository, 'findOne').mockImplementationOnce(async () => {
        return Promise.resolve(existingUser);
      });

      const user = await service.findOne(1);

      expect(user).toBeDefined();
      expect(repository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(repository.findOne).toBeCalledTimes(1);
      expect(user).toEqual(existingUser);
    });

    /**
     * findOne - not found
     * */
    it('not found', async () => {
      jest.spyOn(repository, 'findOne').mockImplementationOnce(async () => {
        return Promise.resolve(null);
      });

      const user = await service.findOne(1);

      expect(repository.findOne).toBeCalledTimes(1);
      expect(repository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    const updateUserDto: UpdateUserDto = new UpdateUserDto();
    updateUserDto.nickName = 'newNickName';

    //update에서 throw되는건 controller에서 test
    it('success', async () => {
      await service.update(1, updateUserDto);
      expect(repository.manager.transaction).toBeCalledTimes(1);
    });
  });
});
