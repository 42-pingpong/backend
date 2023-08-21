import {InternalServerErrorException} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login42', () => {
	it('login42-success', async () => {
	});

	it('login42-fail', async () => {

		expect(
			await controller.login42()
		).toThrowError(InternalServerErrorException)
	});
  }

  describe('redirect42', () => {
	it('redirect42-success', async () => {

	});

	it('redirect42-fail', async () => {});

  }

  describe('refresh', () => {
	it('refresh-success', async () => {});

	it('refresh-fail', async () => {});
  }


});
