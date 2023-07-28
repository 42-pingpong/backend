import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Socket } from 'net';
import { IUser } from 'src/interface/IUser.types';

@Injectable()
export class StatusProducer {
  constructor(@InjectQueue('status') private statusQueue: Queue) {}

  async login(user: IUser, clientId: string, bearerToken: string) {
    await this.statusQueue.add('login', {
      user: user,
      clientId: clientId,
      bearerToken: bearerToken,
    });
  }

  async logout(client: Socket) {
    await this.statusQueue.add('logout', {});
  }
}
