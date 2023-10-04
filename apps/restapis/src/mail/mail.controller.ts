import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendMailDto } from './send-mail.dto';
import { AccessTokenGuard } from '@app/common';
import { Request } from 'express';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({
    summary: '메일 보내기',
    description: '메일 보내기',
  })
  @Post('send')
  async sendMail(@Body() data: SendMailDto) {
    return await this.mailService.sendHello(data);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('code/:cd')
  async verifyCode(@Req() req: Request, @Param('cd') cd: string) {
    return await this.mailService.verify(+req.user.sub, +cd);
  }
}
