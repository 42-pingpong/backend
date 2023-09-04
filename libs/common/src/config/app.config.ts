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
      ignoreEnvFile: true,
      load: [database, auth, url, oauth42, queue],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {
  constructor() {
    console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
  }
}
