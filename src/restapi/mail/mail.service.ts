import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import exp from 'constants';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendHello(): boolean {
    console.log('sendHello!!!!!');
    this.mailerService
      .sendMail({
        from: 'duqkdxm@gmail.com',
        to: 'duqkdxm@gamil.com',
        subject: 'Testing Nest MailerModule ✔',
        text: 'Hello world!!',
        html: '<b>Hello world!!</b>',
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
