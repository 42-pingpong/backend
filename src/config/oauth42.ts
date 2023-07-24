import { registerAs } from '@nestjs/config';

export default registerAs('oauth42', () => ({
  authorizationURL: 'https://api.intra.42.fr/v2/oauth/authorize',
  tokenURL: 'https://api.intra.42.fr/v2/oauth/token',
  clientId: process.env.CLIENT42,
  clientSecret: process.env.SECRET42,
  callbackURL: process.env.REDIRECT42,
}));
