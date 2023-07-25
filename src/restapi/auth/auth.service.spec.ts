import { createMock } from '@golevelup/ts-jest';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import auth from 'src/config/auth';
import { Token } from 'src/entities/auth/token.entity';
import { User } from 'src/entities/user/user.entity';
import { ITokens } from 'src/interface/ITokens.types';
import { IUser } from 'src/interface/IUser.types';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let userRepository: Repository<User>;
  let tokenRepository: Repository<Token>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
		imports: [ConfigModule.forRoot({
			load: [auth]
		})]
		,
      providers: [
        AuthService,
        UserService,
        JwtService,
        ConfigService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Token),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    tokenRepository = module.get<Repository<Token>>(getRepositoryToken(Token));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(tokenRepository).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('login', () => {
    /*
     * login test.
     *
     * 1. repository에서 유저를 찾는다.
     * 2. 유저가 존재하면 user를 기반으로 토큰을 발급한다.
     * 3. 유저가 존재하지 않으면 유저를 생성(register)하고, 토큰을 발급한다.
     */
    describe('login sucess', () => {
      it('existing user', async () => {
        const user: IUser = {
          id: 1,
          email: 'asdf',
          nickName: 'asdf',
          profile: 'asdf',
          selfIntroduction: 'asdf',
          level: 1,
        };
        const token = {
          accessToken: 'asdf',
          refreshtoken: 'asdf',
        };
        userRepository.findOne = jest.fn().mockResolvedValueOnce(user);
        authService.issueTokens = jest.fn().mockResolvedValueOnce(token);

        expect(await authService.login(user)).toEqual(token);
      });

      it('new user', async () => {
        const newUser: IUser = {
          id: 2,
          email: 'asdf',
          nickName: 'asdf',
          profile: 'asdf',
          selfIntroduction: 'asdf',
          level: 1,
        };
        const token = {
          accessToken: 'asdf',
          refreshtoken: 'asdf',
        };
        userRepository.findOne = jest.fn().mockResolvedValueOnce(null);
        authService.register = jest.fn().mockResolvedValueOnce(newUser);
        authService.issueTokens = jest.fn().mockResolvedValueOnce(token);

        expect(await authService.login(newUser)).toEqual(token);
      });
    });

    /**
     * login fail test.
     *
     * 1. database 에러
     * 2. 토큰 발급 에러
     * */
    describe('login-fail', () => {
      describe('database error', () => {
        it('user find error', async () => {
          const user: IUser = {
            id: 1,
            email: 'asdf',
            nickName: 'asdf',
            profile: 'asdf',
            selfIntroduction: 'asdf',
            level: 1,
          };
          userRepository.findOne = jest
            .fn()
            .mockRejectedValueOnce(new InternalServerErrorException());

          await expect(authService.login(user)).rejects.toThrow(
            InternalServerErrorException,
          );
        });

        it('user save error', async () => {
          const user: IUser = {
            id: 1,
            email: 'asdf',
            nickName: 'asdf',
            profile: 'asdf',
            selfIntroduction: 'asdf',
            level: 1,
          };
          userRepository.findOne = jest.fn().mockResolvedValueOnce(null);
          userRepository.save = jest
            .fn()
            .mockRejectedValueOnce(new Error('database error'));

          await expect(authService.login(user)).rejects.toThrow(
            'database error',
          );
        });
      });

      describe('token issue error', () => {
        it('token issue error', async () => {
          const user: IUser = {
            id: 1,
            email: 'asdf',
            nickName: 'asdf',
            profile: 'asdf',
            selfIntroduction: 'asdf',
            level: 1,
          };
          const token = {
            accessToken: 'asdf',
            refreshtoken: 'asdf',
          };
          userRepository.findOne = jest.fn().mockResolvedValueOnce(user);
          authService.issueTokens = jest
            .fn()
            .mockRejectedValueOnce(new Error('token issue error'));

          await expect(authService.login(user)).rejects.toThrow(
            'token issue error',
          );
        });
      });
    });
  });

  /**
   * register test.
   * 새로운 유저를 database에 생성.
   * */
  describe('register', () => {
    const newUser: IUser = {
      id: 2,
      email: 'asdf',
      nickName: 'asdf',
      profile: 'asdf',
      selfIntroduction: 'asdf',
      level: 1,
    };

    it('register-success', async () => {
      userRepository.save = jest.fn().mockResolvedValueOnce(newUser);

      expect(await authService.register(newUser)).toEqual(newUser);
    });

    it('register-fail', async () => {
      userRepository.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('database error'));

      await expect(authService.register(newUser)).rejects.toThrow(
        'database error',
      );
    });
  });

  /**
   * token issue test
   * */
  describe('issue tokens함수에 대한 테스트코드.', () => {
    const user: User = new User();
    user.id = 1;
    user.email = 'asdf';
    user.nickName = 'asdf';
    user.profile = 'asdf';
    user.selfIntroduction = 'asdf';
    user.level = 1;

    beforeAll(() => {
      expect(authService.issueTokens).toBeDefined();
      expect(authService.issueRefreshToken).toBeDefined();
      expect(authService.issueAccessToken).toBeDefined();
    });

    it('issue tokens success', async () => {
      const refToken = 'asdf';
      const accToken = 'asdf';
      const token: ITokens = {
        refreshToken: refToken,
        accessToken: accToken,
      };
      authService.issueRefreshToken = jest.fn().mockResolvedValueOnce(refToken);
      authService.issueAccessToken = jest.fn().mockResolvedValueOnce(accToken);
      tokenRepository.save = jest.fn();

      expect(await authService.issueTokens(user)).toEqual(token);
      expect(authService.issueRefreshToken).toBeCalledTimes(1);
      expect(authService.issueAccessToken).toBeCalledTimes(1);
      expect(tokenRepository.save).toBeCalledTimes(1);
    });

	/**
	 * token issue fail 테스트케이스
	 * 1. refresh token issue fail
	 * 2. acc tok issue fail
	 * 3. token save fail
	* */
    describe('issue tokens fail', () => {
      const refToken = 'asdf';
      const accToken = 'asdf';
      const user: User = new User();
      user.id = 1;
      user.email = 'asdf';
      user.nickName = 'asdf';
      user.profile = 'asdf';
      user.selfIntroduction = 'asdf';
      user.level = 1;

      beforeEach(() => {
        authService.issueRefreshToken = jest.fn().mockResolvedValue(refToken);
        authService.issueAccessToken = jest.fn().mockResolvedValue(accToken);
        tokenRepository.save = jest.fn();
      });

      it('issue refresh token fail', async () => {
        authService.issueRefreshToken = jest
          .fn()
          .mockRejectedValueOnce(new Error());
        await expect(authService.issueTokens(user)).rejects.toThrow(Error);
      });

      it('issue access token fail', async () => {
		authService.issueAccessToken = jest
		.fn()
		.mockRejectedValueOnce(new Error());
		await expect(authService.issueTokens(user)).rejects.toThrow(Error);
	  });

      it('save token fail', async () => {
		tokenRepository.save = jest
		  .fn()
		  .mockRejectedValueOnce(new InternalServerErrorException());
		await expect(authService.issueTokens(user)).rejects.toThrow(
			InternalServerErrorException
		);
	  })
	  });
    });
  });

  /**
   * refresh token기반 access token 재발급 절차.
   * refresh token에는 userId 존재함.
   * success
   * case 1. 성공
   *
   * fail
   * case 1. refresh token내에 userId 존재함. token entity의 발급자와 로그인 유저의 id가 다른 경우.
   * case 2. 사용자 cookie의 refresh token과 access token이 database에 저장된 refresh token, access token과 매칭되지 않는경우.
   *
  * */
  describe('refreshAccessToken', () => {
    it('success', async () => {});

    describe('fail', async () => {
		it('different issuer', async () => {})

		it('matching fail', async () => {})
	});
  });
});
