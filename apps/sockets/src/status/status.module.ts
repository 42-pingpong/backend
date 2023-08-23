import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { StatusService } from './status.service';
import { AppConfigModule } from '@app/common/config/app.config';

@Module({
  imports: [JwtModule, AppConfigModule],
  providers: [StatusGateway, JwtService, StatusService],
})
export class StatusModule {}
