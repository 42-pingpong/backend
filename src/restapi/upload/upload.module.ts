import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { AccessTokenGuard } from '../auth/Guards/accessToken.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppConfigModule } from 'src/config/app.config';

@Module({
  imports: [
    AppConfigModule,
    ServeStaticModule.forRoot({
      rootPath: 'uploads',
      serveRoot: '/images',
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, AccessTokenGuard],
})
export class UploadModule {}
