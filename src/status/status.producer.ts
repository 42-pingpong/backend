import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Socket } from 'net';

@Injectable()
export class StatusProducer {
  constructor(@InjectQueue('status') private statusQueue: Queue) {}

  async login(client: Socket) {
    await this.statusQueue.add('login', {});
  }

  async logout(client: Socket) {
    await this.statusQueue.add('logout', {});
  }
}
