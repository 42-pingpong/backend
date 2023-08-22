import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import exp from 'constants';
import { SendMailDto } from './send-mail.dto';

export class MailData {
  id: number;
  nickName: string;
  code: string;
}

const datas: MailData[] = [];

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendHello(data: SendMailDto) {
    const validationCode = Math.floor(Math.random() * 10000).toString();
    // const validationCode = crypto.randomUUID.toString();
    console.log(validationCode);
    datas.push({
      id: data.userId,
      nickName: data.nickName,
      code: validationCode,
    });

    await this.mailerService
      .sendMail({
        from: '42pongping@gmail.com',
        to: data.mailAddress,
        subject: `Testing Nest MailerModule ✔ to ${data.nickName}`,

        html: `hi ${data.nickName}</br>
          인증번호: ${validationCode}`,

        // html:
        //   `인증 링크` +
        //   `http://localhost/mail/authentication/${validationCode}`,
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

  async getCode(id: number) {
    const data = datas.find((data) => data.id === id);
    if (!data) {
      return null;
    }
    return data.code;
  }
}
