import { Module } from '@nestjs/common';
import { QueueModule } from 'src/queue/queue.module';
import { StatusConsumer } from './status.consumer';

@Module({
  imports: [QueueModule, StatusConsumer],
})
export class ConsumerModule {}
