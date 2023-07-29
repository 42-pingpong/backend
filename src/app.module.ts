import { Module } from '@nestjs/common';
import { RestapiModule } from './restapi/restapi.module';
import { appDatabase } from './datasource/appdatabase';
import { AppConfigModule } from './config/app.config';
import { ConsumerModule } from './consumer/consumer.module';
import { SocketModule } from './sockets/sockets.module';

@Module({
  imports: [
    AppConfigModule,
    appDatabase,
    RestapiModule,
    SocketModule,
    ConsumerModule,
  ],
})
export class AppModule {}
