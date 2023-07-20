import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/entities/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

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
              transaction: jest
                .fn()
                .mockImplementation(async (manager: EntityManager) => {
                  manager = new EntityManager(null);
                  manager.update = jest.fn();
                }),
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

      expect((await service.create(createUserDto)).id).toEqual(
        createUserDto.id,
      );
    });
  });

  describe('findOne', () => {
    /**
     * findOne - success
     * */
    it('findOne', async () => {
      existingUser.id = 1;

      jest.spyOn(repository, 'findOne').mockImplementationOnce(() => {
        return Promise.resolve(existingUser);
      });

      expect((await service.findOne(existingUser.id)).id).toEqual(
        existingUser.id,
      );
    });

    /**
     * findOne - not found
     * */
    it('findOne - not found', async () => {
      jest.spyOn(repository, 'findOne').mockImplementationOnce(() => {
        return Promise.resolve(null);
      });

      expect(await service.findOne(1)).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = new UpdateUserDto();
    updateUserDto.nickName = 'newNickName';

    //update에서 throw되는건 controller에서 test
    it('update - success', async () => {
      await service.update(1, updateUserDto);
      expect(repository.manager.transaction).toBeCalledTimes(1);
    });
  });
});
