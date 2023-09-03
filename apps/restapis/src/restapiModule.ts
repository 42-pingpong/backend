import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { DynamicAuthModule } from './auth/auth.dynamic.module';
import { UploadModule } from './upload/upload.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    UserModule,
    ChatModule,
    UploadModule,
    GameModule,
    DynamicAuthModule.forRoot(),
  ],
})
export class RestapiModule {}
