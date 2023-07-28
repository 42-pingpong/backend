import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { QueueModule } from 'src/queue/queue.module';
import { BullModule } from '@nestjs/bull';
import { StatusProducer } from './status.producer';
import { StatusConsumer } from './status.consumer';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    QueueModule,
    JwtModule,
    BullModule.registerQueue({ name: 'status' }),
  ],
  providers: [StatusGateway, StatusProducer, StatusConsumer, JwtService],
})
export class StatusModule {}
