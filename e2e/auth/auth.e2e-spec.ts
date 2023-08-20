import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { testDatabase } from 'src/datasource/testDatabase';
import { AuthModule } from 'src/restapi/auth/auth.module';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { appDatabase } from 'src/datasource/appdatabase';
import { User } from 'src/entities/user/user.entity';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';
import { user3, user4, user5 } from '../fixtures/users/user-3';
import { FTAuthGuard } from 'src/restapi/auth/Guards/ft.guard';
import { JwtService } from '@nestjs/jwt';
import { Token } from 'src/entities/auth/token.entity';
import { RefreshTokenGuard } from 'src/restapi/auth/Guards/refreshToken.guard';
import { ITokenPayload } from 'src/interface/IUser.types';
import { ConfigService } from '@nestjs/config';

describe('Auth', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let ftGuard: FTAuthGuard;
  let refGuard: RefreshTokenGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [
        {
          provide: FTAuthGuard,
          useValue: {
            canActivate: jest.fn(),
          },
        },
      ],
    })
      .overrideModule(appDatabase)
      .useModule(testDatabase)
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .compile();

    app = module.createNestApplication();
    await app.init();

    dataSource = module.get<DataSource>(DataSource);
    ftGuard = module.get<FTAuthGuard>(FTAuthGuard);
    refGuard = module.get<RefreshTokenGuard>(RefreshTokenGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('GET /auth/42/login', () => {
    it('GET /auth/42/login', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/42/login')
        .expect(302);
    });
  });

  describe('GET /auth/42/redirect', () => {
    /**
     * auth/42/login에서 성공적으로 로그인하면, authorization code를 받아옴
     * 그리고 auth/42/redirect로 redirect됨
     *
     * 여기서 authGuard의 canActivate함수가 실행됨.
     * canActivate함수는 42api에 User정보를 access token으로 가져오게됨.
     * 그리고 가져온 정보를 바탕으로 user를 생성하고, jwt token을 생성함.
     * 그리고 jwt token을 cookie에 저장하고, redirect함.
     *
     * 이 테스트에서는, authGuard의 canActivate함수를 mock으로 대체하고
     * request에 user정보를 넣어줌.
     * true를 반환하게함.
     * 따라서, 다음 context에서는 authService.login함수가 실행.
     * */
    describe('GET /auth/42/redirect', () => {
      /**
       * 새로운 유저가 로그인하는 경우
       * */
      it('New user', async () => {
        ftGuard.canActivate = jest
          .fn()
          .mockImplementationOnce((context: ExecutionContext) => {
            context.switchToHttp().getRequest().user = user3;
            return true;
          });
        const res = await request(app.getHttpServer())
          .get('/auth/42/redirect')
          .expect(302);

        /**
         * 토큰이 정상적으로 생성되었는지 확인
         * */
        const accessToken = res.headers['set-cookie'][0]
          .split('=')[1]
          .split(';')[0];
        const refreshToken = res.headers['set-cookie'][1]
          .split('=')[1]
          .split(';')[0];
        expect(accessToken).toBeTruthy();
        expect(refreshToken).toBeTruthy();

        /**
         * 발급한 토큰과 DB에 저장된 토큰이 일치하는지 확인
         * */
        const user = await dataSource.manager.findOne(User, {
          where: { id: user3.id },
          relations: ['tokens'],
        });
        expect(user.tokens[0].accessToken).toBe(accessToken);
        expect(user.tokens[0].refreshToken).toBe(refreshToken);

        await dataSource.manager.delete(Token, { ownerId: user3.id });
        await dataSource.manager.delete(User, { id: user3.id });
      });

      /**
       * 기존 유저가 로그인하는 경우
       * */
      it('Existing user', async () => {
        ftGuard.canActivate = jest
          .fn()
          .mockImplementationOnce((context: ExecutionContext) => {
            context.switchToHttp().getRequest().user = user4;
            return true;
          });

        const res = await request(app.getHttpServer())
          .get('/auth/42/redirect')
          .expect(302);

        /**
         * 토큰이 정상적으로 생성되었는지 확인
         * */
        const accessToken = res.headers['set-cookie'][0]
          .split('=')[1]
          .split(';')[0];
        const refreshToken = res.headers['set-cookie'][1]
          .split('=')[1]
          .split(';')[0];

        expect(accessToken).toBeTruthy();
        expect(refreshToken).toBeTruthy();

        /**
         *
         * 	* 발급한 토큰과 DB에 저장된 토큰이 일치하는지 확인
         * 	* */
        const user = await dataSource.manager.findOne(User, {
          where: { id: user4.id },
          relations: ['tokens'],
        });

        expect(user.tokens[0].accessToken).toBe(accessToken);
        expect(user.tokens[0].refreshToken).toBe(refreshToken);

        await dataSource.manager.delete(Token, { ownerId: user4.id });
        await dataSource.manager.delete(User, { id: user4.id });
      });
    });
  });

  describe('GET /auth/refresh', () => {
    let accessToken: string;
    let refreshToken: string;
    let defaultResponse: request.Response;

    beforeEach(async () => {
      ftGuard.canActivate = jest
        .fn()
        .mockImplementation((context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = user5;
          return true;
        });
      defaultResponse = await request(app.getHttpServer())
        .get('/auth/42/redirect')
        .expect(302);

      accessToken = defaultResponse.headers['set-cookie'][0]
        .split('=')[1]
        .split(';')[0];

      refreshToken = defaultResponse.headers['set-cookie'][1]
        .split('=')[1]
        .split(';')[0];
    });

    /**
     * 유효햔 요청
     * */
    it('Valid request', async () => {
      jest
        .spyOn(refGuard, 'canActivate')
        .mockImplementationOnce(async (context: ExecutionContext) => {
          const payload = jwtService.decode(refreshToken);
          const obj =
            typeof payload === 'object' ? payload : JSON.parse(payload);
          context.switchToHttp().getRequest().user = {
            accessToken,
            refreshToken,
            ...obj,
          };
          return true;
        });

      const refreshResponse = await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', defaultResponse.headers['set-cookie'])
        .expect(302);

      /**
       * 헤더 정의되어있을것.
       * */
      expect(
        refreshResponse.headers['set-cookie'][0].split('=')[1].split(';')[0],
      ).toBeTruthy();
      expect(
        refreshResponse.headers['set-cookie'][1].split('=')[1].split(';')[0],
      ).toBeTruthy();

      /**
       * 토큰이 새로 발급되었는지 확인
       * */
      expect(
        accessToken !==
          refreshResponse.headers['set-cookie'][0].split('=')[1].split(';')[0],
      );
      expect(
        refreshToken !==
          refreshResponse.headers['set-cookie'][1].split('=')[1].split(';')[0],
      );
      jest.spyOn(refGuard, 'canActivate').mockClear();
    });

    /**
     * access token 없이 요청한 경우
     * */
    it('No access token', async () => {
      await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', refreshToken)
        .expect(401);
    });

    /**
     * refresh token이 없는 경우
     * */
    it('No refresh token', async () => {
      await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', accessToken)
        .expect(401);
    });

    /**
     * refresh token이 만료된 경우
     * */
    it('Expired refresh token', async () => {
      const newrefToken = await jwtService.signAsync(
        { id: user5.id },
        { expiresIn: 0, secret: configService.get('jwt.refresh_secret') },
      );
      await dataSource.manager.update(
        Token,
        { ownerId: user5.id },
        { refreshToken: newrefToken },
      );

      await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', [accessToken, newrefToken])
        .expect(401);

      await dataSource.manager.update(
        Token,
        { ownerId: user5.id },
        { refreshToken },
      );
    });

    /**
     *  최근 발급한 access token정보와 cookie의 토큰이 다른경우
     * */
    it('different issued access token', async () => {
      const newAccToken = await jwtService.signAsync(
        { id: user5.id },
        { expiresIn: 60, secret: configService.get('jwt.access_secret') },
      );

      await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', [newAccToken, refreshToken])
        .expect(401);
    });

    /**
     * 최근 발급한 refresh token정보와 cookie의 토큰이 다른경우
     * */
    it('different issued refresh token', async () => {
      const newRefToken = await jwtService.signAsync(
        { id: user5.id },
        { expiresIn: 60, secret: configService.get('jwt.refresh_secret') },
      );

      await request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Cookie', [accessToken, newRefToken])
        .expect(401);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });
});
