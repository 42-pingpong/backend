import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user/user.entity';
import { CreateUserDto } from 'src/restapi/user/dto/create-user.dto';
import { ITokens } from 'src/interface/ITokens.types';
import { IUser } from 'src/interface/IUser.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from 'src/entities/auth/token.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  /**
   * @brief 유저를 로그인한다.
   * @description 유저를 로그인하고, DB에 저장, 발급된 토큰을 반환한다.
   * @param IUser
   *
   * @return ITokens
   */
  async login(user: IUser) {
    const foundUser = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (foundUser) {
      return { ...(await this.issueTokens(foundUser.id)) };
    } else {
      const newUser = await this.register(user);
      return {
        ...(await this.issueTokens(newUser.id)),
      };
    }
  }

  /**
   * @brief 유저를 등록한다.
   * @description 유저를 등록하고, DB에 저장, 등록된 유저를 반환한다.
   * @param IUser
   *
   * @return User
   */
  async register(user: IUser) {
    const createUserDto: CreateUserDto = {
      id: user.id,
      email: user.email,
      nickName: user.nickName,
      fullName: user.fullName,
      profile: user.profile,
      selfIntroduction: user.selfIntroduction,
      level: user.level,
    };
    return await this.userRepository.save(createUserDto);
  }

  /**
   * @brief token을 발급한다.
   * @description 토큰을 발급하고, 발급된 토큰을 DB에 저장한다.
   * @param User: 토큰 발급하는 유저
   *
   * @return ITokens: 발급된 토큰
   */
  async issueTokens(userId: number): Promise<ITokens> {
    // 토큰 발급
    try {
      const tokens: ITokens = {
        accessToken: await this.issueAccessToken(userId),
        refreshToken: await this.issueRefreshToken(userId),
      };
      // 토큰 저장
      const token = new Token();
      token.ownerId = userId;
      token.refreshToken = tokens.refreshToken;
      token.accessToken = tokens.accessToken;
      //!! 토큰 저장시 기존 토큰 삭제
      await this.tokenRepository.delete({ ownerId: userId });
      await this.tokenRepository.save(token);
      return tokens;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @brief refresh token을 발급한다.
   * @TODO expire 환경변수화
   * @param User
   *
   * @return string
   */
  async issueRefreshToken(userId: number): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        // this expires check in refresh token guard
        expiresIn: 60,
        secret: this.configService.get<string>('jwt.refresh_secret'),
      },
    );
    return refreshToken;
  }

  /**
   * @brief access token을 발급한다.
   * @TODO expire 환경변수화
   * @param User
   *
   * @return string
   */
  async issueAccessToken(userId: number): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        // this expires check in access token guard
        expiresIn: 30,
        secret: this.configService.get<string>('jwt.access_secret'),
      },
    );
    return accessToken;
  }

  /**
   * @brief refresh token을 검증, 재발급한다.
   * @description refresh token을 검증하고, refresh token, access token을 재발급해 DB에 저장한다.
   * @return string
   */
  async refreshAccessToken() {}
}
