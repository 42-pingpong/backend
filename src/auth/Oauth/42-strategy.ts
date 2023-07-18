import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import fetch from 'node-fetch';
import * as fs from 'fs';

interface Profile {
  id: number;
  email: string;
  login: string;
  image: any;
  level: number;
}

@Injectable()
export class FourtyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      authorizationURL: 'https://api.intra.42.fr/v2/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/v2/oauth/token',
      clientID: process.env.CLIENT42,
      clientSecret: process.env.APIKEY42,
      callbackURL: process.env.REDIRECT42,
      scope: ['public'],
    });
  }

  async validate(accessToken: string, refreshToken: string) {
    console.log('acc', accessToken);
    console.log('ref', refreshToken);
    let profile: Profile = null;

    try {
      const response = await fetch('https://api.intra.42.fr/v2/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      fs.writeFileSync('test.json', JSON.stringify(json));
      profile = {
        id: json.id,
        email: json.email,
        login: json.login,
        image: json.image,
        level: json.cursus_users[1].level,
      };
      console.log(profile);
    } catch (e) {
      console.log(e);
    }
    // redirection에서 req.user에 profile이 있음.
    return {
      ...profile,
    };
  }
}
