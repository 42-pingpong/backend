import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      //development일때는 .env파일을 무시하고 환경변수를 사용한다.
      ignoreEnvFile: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    ChatModule,
    GameModule,
  ],
})
export class AppModule {}
