import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app.config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: () => ({
        redis: {
          host: 'redis',
          port: 6379,
          db: 1,
        },
      }),
    }),
  ],
})
export class QueueModule {}
