/**
 * @jest-environment node
 * https://docs.nestjs.com/techniques/database#custom-datasource-factory
 *  app module에서 사용되는 데이터베이스 소스.
 * */

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    //typeorm 동적모듈.
    TypeOrmModule.forRootAsync({
      imports: [
        //config module을 동적모듈로 불러와 사용.
        ConfigModule,
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: configService.get<any[]>('database.entities'),
        // synchronize: true,
        synchronize: configService.get<boolean>('database.synchronize'), //for development
        dropSchema: configService.get<boolean>('database.dropSchema'), //for development
      }),
    }),
  ],
})
export class appDatabase {}
