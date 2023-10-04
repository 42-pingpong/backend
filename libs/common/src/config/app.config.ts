import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccessTokenGuard, FTAuthGuard, RefreshTokenGuard } from '../guards';
import {
  AccessTokenStrategy,
  FourtyTwoStrategy,
  RefreshTokenStrategy,
} from '../strategy';
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
  providers: [
    FourtyTwoStrategy,
    FTAuthGuard,
    AccessTokenGuard,
    AccessTokenStrategy,
    RefreshTokenGuard,
    RefreshTokenStrategy,
  ],

  exports: [ConfigModule, AccessTokenGuard, RefreshTokenGuard, FTAuthGuard],
})
export class AppConfigModule {
  constructor() {
    console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
  }
}
