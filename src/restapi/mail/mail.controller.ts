import { Controller, Get, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({
    summary: '메일 보내기',
    description: '메일 보내기',
  })
  @Post('send')
  sendMail(): boolean {
    return this.mailService.sendHello();
  }
}
