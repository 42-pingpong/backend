import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import fetch from 'node-fetch';

interface Profile {
  id: number;
  email: string;
  login: string;
  image: any;
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
    let profile: Profile;

    try {
      const response = await fetch('https://api.intra.42.fr/v2/me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      profile = {
        id: json.id,
        email: json.email,
        login: json.login,
        image: json.image,
      };
      console.log(profile);
    } catch (e) {
      console.log(e);
    }

    //     try {
    //       const response = await fetch(
    //         `https://api.intra.42.fr/v2/users/106987/scale_teams/as_corrector`,
    //         {
    //           method: 'GET',
    //           headers: {
    //             Authorization: 'Bearer ' + accessToken,
    //             'Content-Type': 'application/json',
    //           },
    //         },
    //       );
    //       const json = await response.json();
    //       console.log(json);
    //     } catch (e) {
    //       console.log(e);
    //     }

    //     try {
    //       const response = await fetch(
    //         `https://api.intra.42.fr/v2/users/106987/scale_teams/as_corrected`,
    //         {
    //           method: 'GET',
    //           headers: {
    //             Authorization: 'Bearer ' + accessToken,
    //             'Content-Type': 'application/json',
    //           },
    //         },
    //       );
    //       const json = await response.json();
    //       console.log(json);
    //     } catch (e) {
    //       console.log(e);
    //     }
    return {
      ...profile,
    };
  }
}
