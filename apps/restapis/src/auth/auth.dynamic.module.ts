import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { FakeauthModule } from '../fakeauth/fakeauth.module';
import { RequestController } from '../request/request.controller';
import { RequestModule } from '../request/request.module';

@Global()
@Module({})
export class DynamicAuthModule {
  static forRoot(): DynamicModule {
    const isFakeAuthEnabled =
      process.env.NODE_ENV === 'development'
        ? true
        : process.env.NODE_ENV === 'test'
        ? true
        : false;

    const imports = isFakeAuthEnabled
      ? [FakeauthModule, AuthModule]
      : [AuthModule];

    return {
      module: DynamicAuthModule,
      imports,
    };
  }
}
