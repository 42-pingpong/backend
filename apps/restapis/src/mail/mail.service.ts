import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailDto } from './send-mail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@app/common';
import { Repository } from 'typeorm';

export class MailData {
  id: number;
  nickName: string;
  code: string;
}

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async sendHello(data: SendMailDto) {
    // 6자리 수
    const validationCode = Math.floor(Math.random() * 1000000);

    await this.userRepository.update(data.userId, {
      emailCode: validationCode,
    });

    await this.mailerService.sendMail({
      from: '42pongping@gmail.com',
      to: data.mailAddress,
      subject: `Testing Nest MailerModule ✔ to ${data.nickName}`,

      html: `hi ${data.nickName}<br/>
          인증번호: ${validationCode}`,
    });
    return true;
  }

  async getCode(id: number) {
    const userData = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    return userData.emailCode;
  }

  async verify(id: number, code: number) {
    return await this.userRepository.manager.transaction(async (manager) => {
      const userData = await manager.findOne(User, {
        where: {
          id: id,
        },
      });
      if (userData.emailCode == code) {
        await manager.update(User, id, {
          isEmailVerified: true,
        });
        return await manager.findOne(User, {
          where: {
            id: id,
          },
        });
      } else {
        throw new UnauthorizedException('인증번호가 일치하지 않습니다.');
      }
    });
  }
}
