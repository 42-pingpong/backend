import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendHello(): boolean {
    console.log('sendHello!!!!!');
    this.mailerService
      .sendMail({
        from: '42pongping@gmail.com',
        to: '42pongping@gmail.com',
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
