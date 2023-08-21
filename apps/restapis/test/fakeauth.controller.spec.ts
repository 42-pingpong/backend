import { Test, TestingModule } from '@nestjs/testing';
import { FakeauthController } from '../src/fakeauth/fakeauth.controller';
import { FakeauthService } from './fakeauth.service';

describe('FakeauthController', () => {
  let controller: FakeauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FakeauthController],
      providers: [FakeauthService],
    }).compile();

    controller = module.get<FakeauthController>(FakeauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
