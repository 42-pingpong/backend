import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { testDatabase } from 'src/datasource/testDatabase';
import { Token } from 'src/entities/auth/token.entity';
import { User } from 'src/entities/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { AuthModule } from 'src/restapi/auth/auth.module';
import { AuthService } from 'src/restapi/auth/auth.service';
import { user3 } from 'test/fixtures/users/user-3';

describe('Auth -/Auth (e2e)', () => {
  let datasource: DataSource;
  let userRepository: Repository<User>;
  let tokenRepository: Repository<Token>;
  let configService: ConfigService;
  let authService: AuthService;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [testDatabase],
    }).compile();
    const app = module.createNestApplication();
    await app.init();

    datasource = module.get<DataSource>(DataSource);
    configService = module.get<ConfigService>(ConfigService);
    authService = module.get<AuthService>(AuthService);
    userRepository = datasource.getRepository(User);
    tokenRepository = datasource.getRepository(Token);
    agent = request.agent(configService.get<string>('url.testUrl'));
  });

  describe('GET /auth/42/login test', () => {
    it('GET /auth/42/login should redirect with authorization code', async () => {
      const res = await agent.get('/auth/42/login').expect(302);
    });

    it('GET /auth/42/login should create user and token', async () => {
      const registeredUser = user3;
      await expect(userRepository.save(registeredUser)).resolves.toEqual(
        registeredUser,
      );
      authService.login(registeredUser);
    });
  });
});
