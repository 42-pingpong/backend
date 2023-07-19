import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/entities/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateResult } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  const existingUser = new User();
  const createUserDto: CreateUserDto = new CreateUserDto();

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
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
      jest.spyOn(service, 'findOne').mockImplementationOnce(() => {
        return null;
      });

      createUserDto.id = 2;

      const newUser = new User();
      newUser.id = 2;

      jest
        .spyOn(repository.manager, 'transaction')
        .mockImplementationOnce(() => Promise.resolve(newUser));

      expect((await service.create(createUserDto)).id).toEqual(
        createUserDto.id,
      );
    });

    it('create - internal exception', async () => {
      jest
        .spyOn(repository.manager, 'transaction')
        .mockRejectedValueOnce(InternalServerErrorException);

      expect(await service.create(createUserDto)).toThrowError(
        InternalServerErrorException,
      );
    });

    /**
     * create - 동일한 id가 존재할 경우
     * */
    it('create - duplicated id', async () => {
      existingUser.id = 1;

      jest
        .spyOn(repository.manager, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(existingUser));

      createUserDto.id = 1;

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
    const updateUser: UpdateUserDto = new UpdateUserDto();
    const updateResult = new UpdateResult();

    it('update - success', async () => {
      updateResult.affected = 1;
      jest.spyOn(repository, 'update').mockImplementationOnce(() => {
        return Promise.resolve(updateResult);
      });

      expect(await service.update(1, updateUser)).toBeNull();
    });

    it('update - duplicated nickName', async () => {
      updateUser.nickName = 'duplicated';
      jest
        .spyOn(repository, 'findOne')
        .mockImplementationOnce(() => Promise.resolve(existingUser));

      expect(await service.update(1, updateUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('update - not found', async () => {
      updateResult.affected = 0;
      jest.spyOn(repository, 'update').mockImplementationOnce(() => {
        return Promise.resolve(updateResult);
      });

      expect((await service.update(1, updateUser)).affected).toEqual(0);
    });
  });
});
