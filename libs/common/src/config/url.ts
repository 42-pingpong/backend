import { registerAs } from '@nestjs/config';

export default registerAs('url', () => ({
  frontHost:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? 'http://localhost'
      : process.env.REACT_APP_HOST,
  frontPort: process.env.REACT_PORT,

  nestServerUrl:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? process.env.NESTSERVER
      : '',

  restApiUrl:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? process.env.RESTAPISERVER
      : '',

  statusServerUrl:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? process.env.STATUSSERVER
      : '',

  gameServerUrl:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? process.env.GAMESERVER
      : '',

  chatServerUrl:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? process.env.CHATSERVER
      : '',
}));
