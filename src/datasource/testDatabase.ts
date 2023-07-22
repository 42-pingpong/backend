/**
 * @jest-environment node
 * test시에만 사용되는 데이터베이스 소스.
 * https://docs.nestjs.com/techniques/database#custom-datasource-factory
 * */

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import database from 'src/config/database';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          load: [database],
        }),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        //test suite는 docker network가 아닌, localhost로 접근해야합니다.
        //도커 컨테이너 내부에서 테스트 실행시 너무 느려서 사용하지 않습니다.
        host: 'localhost',
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [join(__dirname, '/../src/entities/*.entity.ts')],
        synchronize: configService.get<boolean>('database.synchronize'), //for development
        dropSchema: configService.get<boolean>('database.dropSchema'), //for development
      }),
    }),
  ],
})
export class testDatabase {}
