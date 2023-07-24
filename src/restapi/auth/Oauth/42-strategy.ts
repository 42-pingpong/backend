import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import fetch from 'node-fetch';
import { CreateUserDto } from 'src/restapi/user/dto/create-user.dto';
import { IUser } from 'src/interface/IUser.types';

@Injectable()
export class FourtyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      //여기서 authorization code 받아옴.
      authorizationURL: 'https://api.intra.42.fr/v2/oauth/authorize',
      //받아온 code와 accesstoekn, refresh token으로 변환.
      tokenURL: 'https://api.intra.42.fr/v2/oauth/token',

      clientID: process.env.CLIENT42,
      clientSecret: process.env.APIKEY42,
      //validate 함수 끝나고 redirect할 url
      callbackURL: process.env.REDIRECT42,
      scope: ['public'],
    });
  }

  async validate(accessToken: string, refreshToken: string) {
    try {
      console.log('validate');
      //resource server에 자원요청
      const response = await fetch('https://api.intra.42.fr/v2/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      const user: IUser = {
        id: json.id,
        level: json.cursus_users[1].level,
        fullName: json.usual_full_name,
        nickName: json.login,
        selfIntroduction: 'Hi!',
        profile: json.image.link,
        email: json.email,
      };
      return {
        ...user,
      };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
