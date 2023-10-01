import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendMailDto } from './send-mail.dto';

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

  @ApiOperation({
    summary: '메일 인증',
    description: '메일 인증코드 반환',
  })
  @Get('code/:id')
  async getCode(@Param('id') id: number) {
    return await this.mailService.getCode(id);
  }
}
