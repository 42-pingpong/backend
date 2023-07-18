import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/entities/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { setupDataSource } from 'src/datasource/setupDataSource';
import {TypeOrmModule} from '@nestjs/typeorm';

const user: CreateUserDto = {
  id: 1,
  level: 5.5,
  nickName: 'test',
  profile: 'test',
  selfIntroduction: 'test',
};

describe('UserService', () => {
  let service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
		  TypeOrmModule.forRoot({  
			  name: 'default',
			  synchronize: true,
			}),
	  ],
      providers: [UserService],
    })
	.overrideProvider(setupDataSource)
	.useValue(setupDataSource)
	.compile();

    service = module.get<UserService>(UserService);
    await service.create(user);
  });

  it('should be defsned', () => {
    expect(service).toBeDefined();
  });

  describe('create', async () => {
    it('create', async () => {
      const result = await service.findOne(1);
      expect(result).toBeDefined();
      expect(result.id).toEqual(1);
    });

    it('create - duplicated id', async () => {
      const result = await service.create(user);
      expect(result).toBeUndefined();
      expect(result.id).toEqual(1);
    });
  });

  describe('findOne', () => {
    it('findOne', async () => {
      const user = await service.findOne(1);
      expect(user).toBeDefined();
      expect(user.id).toEqual(1);
    });

    it('findOne - not found', async () => {
      try {
        const user = await service.findOne(1111);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', async () => {
    const user2: CreateUserDto = {
      id: 2,
      level: 5.5,
      nickName: 'test2',
      profile: 'test2',
      selfIntroduction: 'test2',
    };
    await service.create(user2);

    const updateUser: UpdateUserDto = new UpdateUserDto();
    const userId = 2;

    it('update - success', async () => {
      updateUser.nickName = 'testNotDuplicated';

      await service.update(userId, updateUser);
      const result = await service.findOne(userId);
      expect(result).toBeDefined();
      expect(result.id).toEqual(userId);
      expect(result.nickName).toEqual(updateUser.nickName);
    });

    it('update - duplicated nickName', async () => {
      updateUser.nickName = 'test';

	  try {
      await service.update(userId, updateUser);
	  } catch (e) {
		expect(e).toBeInstanceOf(ConflictException)
    });

    it('update - not found', async () => {
		try {
			await service.update(1111, updateUser);
		} catch (e) {
			expect(e).toBeInstanceOf(NotFoundException);
		}
	});

  });
});
