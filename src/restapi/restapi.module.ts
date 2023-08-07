import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { DynamicAuthModule } from './auth.dynamic.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [UserModule, ChatModule, UploadModule, DynamicAuthModule.forRoot()],
})
export class RestapiModule {}
