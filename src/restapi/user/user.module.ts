import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.entity';
import { appDatabase } from 'src/datasource/appdatabase';
import { Token } from 'src/entities/auth/token.entity';

@Module({
  imports: [appDatabase, TypeOrmModule.forFeature([User, Token])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
