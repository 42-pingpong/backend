import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from 'src/config/app.config';

@Module({
  imports: [
    AppConfigModule,
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('queue.redisHost'),
          port: configService.get<number>('queue.redisPort'),
          db: configService.get<number>('queue.bullDatabase'),
        },
      }),
    }),
  ],
})
export class QueueModule {}
