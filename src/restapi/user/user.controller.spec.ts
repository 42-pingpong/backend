import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { User } from 'src/entities/user/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const id = '1';
      const user = new User();
      user.id = +id;
      jest
        .spyOn(service, 'findOne')
        .mockImplementation(async () => Promise.resolve(user));
      expect(await controller.findOne('1')).toBe(user);
    });
  });

  describe('update', () => {
    it('not found user', async () => {
      jest.spyOn(service, 'update').mockRejectedValueOnce(NotFoundException);

      expect(await controller.update('1', new UpdateUserDto())).toThrow(
        NotFoundException,
      );
    });

    it('conflict nickname', async () => {
      jest.spyOn(service, 'update').mockRejectedValueOnce(ConflictException);

      expect(await controller.update('1', new UpdateUserDto())).toThrow(
        ConflictException,
      );
    });

    it('scuccess', async () => {
      jest
        .spyOn(service, 'update')
        .mockImplementationOnce(async () => Promise.resolve(void 0));

      expect(await controller.update('1', new UpdateUserDto())).toBe(void 0);
    });
  });
});
