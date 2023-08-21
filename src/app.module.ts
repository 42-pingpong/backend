import { Module } from '@nestjs/common';
import { RestapiModule } from './restapi/restapi.module';
import { appDatabase } from './datasource/appdatabase';
import { AppConfigModule } from './config/app.config';
import { SocketModule } from './sockets/sockets.module';
import { MailModule } from './restapi/mail/mail.module';

@Module({
  imports: [AppConfigModule, appDatabase, RestapiModule, SocketModule],
})
export class AppModule {}
