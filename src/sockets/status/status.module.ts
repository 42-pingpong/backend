import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { QueueModule } from 'src/queue/queue.module';
import { BullModule } from '@nestjs/bull';
import { StatusProducer } from './status.producer';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { StatusService } from './status.service';
import { AccessTokenStrategy } from 'src/restapi/auth/token/access-token.strategy';
import { AccessTokenGuard } from 'src/restapi/auth/Guards/accessToken.guard';
import { AppConfigModule } from 'src/config/app.config';

@Module({
  imports: [
    QueueModule,
    JwtModule,
    BullModule.registerQueue({ name: 'status' }),
    AppConfigModule,
  ],
  providers: [
    StatusGateway,
    StatusProducer,
    JwtService,
    AccessTokenStrategy,
    AccessTokenGuard,
    StatusService,
  ],
})
export class StatusModule {}
