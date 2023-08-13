import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { StatusService } from './status.service';
import { AppConfigModule } from 'src/config/app.config';
import { WsAccessTokenGuard } from '../guards/WsAccessTokenGuard.guard';

@Module({
  imports: [JwtModule, AppConfigModule],
  providers: [StatusGateway, JwtService, WsAccessTokenGuard, StatusService],
})
export class StatusModule {}
