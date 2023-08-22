import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import exp from 'constants';
import { SendMailDto } from './send-mail.dto';

export class MailData {
  nickName: string;
  code: string;
}

const datas: MailData[] = [];

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendHello(data: any) {
    const validationCode = Math.floor(Math.random() * 10000).toString();
    console.log(validationCode);
    datas.push({ nickName: data.nickName, code: validationCode });

    await this.mailerService
      .sendMail({
        from: '42pongping@gmail.com',
        to: data.mailAddress,
        subject: `Testing Nest MailerModule ✔ to ${data.nickName}`,
        // text: `Hello ${data.nickName}!!
        // Your validation code is ${datas[datas.length - 1].code}
        // `,
        // text: 'Hello ${data.nickName}',
        // text: '<b>Hello world!!</b>',
        html: `hi ${data.nickName}</br>
          인증번호: ${validationCode}`,
      })
      .then((success) => {
        console.log('success');
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
    return true;
  }
}
