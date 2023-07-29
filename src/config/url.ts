import { registerAs } from '@nestjs/config';

export default registerAs('url', () => ({
  frontHost:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? 'http://localhost'
      : process.env.REACT_APP_HOST,
  frontPort: process.env.REACT_APP_PORT,

  testUrl:
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? `http://localhost:${process.env.NEST_PORT}/api`
      : '',
}));
