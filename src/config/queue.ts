import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  redisHost:
    process.env.NODE_ENV === 'development'
      ? 'redis'
      : process.env.NODE_ENV === 'test'
      ? 'localhost'
      : process.env.REDIS_HOST,

  redisPort:
    process.env.NODE_ENV === 'development'
      ? 6379
      : process.env.NODE_ENV === 'test'
      ? 6379
      : parseInt(process.env.REDIS_PORT),

  bullDatabase: process.env.BULL_DATABASE,
}));
