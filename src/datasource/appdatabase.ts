/**
 * @jest-environment node
 * https://docs.nestjs.com/techniques/database#custom-datasource-factory
 *  app module에서 사용되는 데이터베이스 소스.
 * */

import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppConfigModule } from 'src/config/app.config';

@Module({
  imports: [
    //typeorm 동적모듈.
    TypeOrmModule.forRootAsync({
      imports: [
        //config module을 동적모듈로 불러와 사용.
        AppConfigModule,
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
        logging: configService.get('database.logging'),
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
})
export class appDatabase {}
