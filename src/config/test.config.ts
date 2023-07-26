import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import auth from './auth';
import database from './database';
import oauth42 from './oauth42';
import url from './url';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvVars: true,
      envFilePath: '.env.test',
      load: [database, auth, url, oauth42],
    }),
  ],
})
export class TestConfigModule {}
