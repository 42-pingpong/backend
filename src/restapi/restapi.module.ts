import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { DynamicAuthModule } from './auth.dynamic.module';

@Module({
  imports: [UserModule, ChatModule, DynamicAuthModule.forRoot()],
})
export class RestapiModule {}
