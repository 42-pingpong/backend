import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  redisHost:
    process.env.NODE_ENV === 'development'
      ? process.env.REDIS_HOST
      : process.env.NODE_ENV === 'test'
      ? 'localhost'
      : process.env.REDIS_HOST,

  redisPort:
    process.env.NODE_ENV === 'development'
      ? 6379
      : process.env.NODE_ENV === 'test'
      ? 6379
      : parseInt(process.env.REDIS_PORT),

  bullDatabase: parseInt(process.env.BULL_DATABASE),
}));
