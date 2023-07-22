/**
 * @jest-environment node
 * test시에만 사용되는 데이터베이스 소스.
 * https://docs.nestjs.com/techniques/database#custom-datasource-factory
 * */

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import database from 'src/config/database';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvVars: true,
          envFilePath: '.env.test',
          load: [database],
        }),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        //test suite는 docker network가 아닌, localhost로 접근해야합니다.
        //도커 컨테이너 내부에서 테스트 실행시 너무 느려서 사용하지 않습니다.
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: configService.get<any[]>('database.entities'),
        synchronize: true, //for development
        dropSchema: true, //for development
      }),
    }),
  ],
})
export class testDatabase {}
