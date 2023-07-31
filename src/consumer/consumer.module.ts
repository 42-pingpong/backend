import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app.config';
import { QueueModule } from 'src/queue/queue.module';
import { StatusConsumer } from './status.consumer';

@Module({
  imports: [AppConfigModule, QueueModule, StatusConsumer],
})
export class ConsumerModule {}
