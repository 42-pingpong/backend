import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import auth from './auth';
import database from './database';
import oauth42 from './oauth42';
import queue from './queue';
import url from './url';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvVars: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.dev'
          : process.env.NODE_ENV === 'test'
          ? '.env.test'
          : '.env.prod',
      load: [database, auth, url, oauth42, queue],
    }),
  ],
})
export class AppConfigModule {}
