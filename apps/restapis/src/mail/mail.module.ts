import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, User } from '@app/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AppConfigModule,
    JwtModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: '42pongping@gmail.com',
          pass: 'rstljuqmoaafbgbr',
        },
      },
      defaults: {
        from: '"defaults" <defaaults@nestjs.com>',
      },
      template: {
        dir: __dirname + '/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
