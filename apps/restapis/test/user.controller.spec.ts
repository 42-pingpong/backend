import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../src/user/user.controller';
import { UserService } from '../src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { User } from 'src/entities/user/user.entity';
import { UpdateUserDto } from '../src/user/dto/update-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

/**
 * service의 기대값을 mock으로 대체, controller를 테스트.
 * */
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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('not found user', async () => {
      service.update = jest.fn().mockImplementationOnce(async () => {
        throw new NotFoundException();
      });

      expect(() => controller.update('1', new UpdateUserDto())).rejects.toThrow(
        NotFoundException,
      );

      expect(service.update).toBeCalledTimes(1);
    });

    it('conflict nickname', async () => {
      service.update = jest.fn().mockImplementationOnce(async () => {
        throw new ConflictException();
      });

      expect(() =>
        controller.update('1', new UpdateUserDto()),
      ).rejects.toThrowError(new ConflictException());
    });

    it('success', async () => {
      jest
        .spyOn(service, 'update')
        .mockImplementationOnce(async () => Promise.resolve(void 0));

      expect(await controller.update('1', new UpdateUserDto())).toBe(void 0);
    });
  });
});
