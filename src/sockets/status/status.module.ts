import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { StatusService } from './status.service';
import { AccessTokenStrategy } from 'src/restapi/auth/token/access-token.strategy';
import { AccessTokenGuard } from 'src/restapi/auth/Guards/accessToken.guard';
import { AppConfigModule } from 'src/config/app.config';

@Module({
  imports: [JwtModule, AppConfigModule],
  providers: [
    StatusGateway,
    JwtService,
    AccessTokenStrategy,
    AccessTokenGuard,
    StatusService,
  ],
})
export class StatusModule {}
