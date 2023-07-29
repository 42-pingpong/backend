import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Socket } from 'net';
import { IUser } from 'src/interface/IUser.types';
import { UserJobData } from 'src/interface/user.jobdata';

@Injectable()
export class StatusProducer {
  constructor(@InjectQueue('status') private statusQueue: Queue) {}

  async login(userId: number, clientId: string, bearerToken: string) {
    const userJobData: UserJobData = {
      userId,
      clientId,
      bearerToken,
    };
    await this.statusQueue.add('login', userJobData);
  }

  async logout(userId: number, clientId: string, bearerToken: string) {
    await this.statusQueue.add('logout', {});
  }
}
