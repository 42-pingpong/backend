import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('database', () => ({
  host: process.env.POSTGRES_DBHOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [join(__dirname, '/../**/*.entity.ts')],
  synchronize:
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'e2e' ||
    process.env.NODE_ENV === 'test'
      ? true //true for dev
      : false,
  dropSchema:
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'e2e' ||
    process.env.NODE_ENV === 'test'
      ? true //true for dev
      : false,
}));
