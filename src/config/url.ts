import { registerAs } from '@nestjs/config';

export default registerAs('url', () => ({
  frontHost:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost'
      : process.env.REACT_HOST,
  frontPort:
    process.env.NODE_ENV === 'development' ? process.env.REACT_PORT : 8080,
}));
