import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { FriendRequestJobData, UserJobData } from 'src/interface/user.jobdata';

@Injectable()
export class StatusProducer {
  constructor(@InjectQueue('status') private statusQueue: Queue) {}

  async login(userId: number, clientId: string, bearerToken: string) {
    const userJobData: UserJobData = {
      userId,
      clientId,
      bearerToken: 'Bearer ' + bearerToken.substring(6),
    };
    this.statusQueue.add('login', userJobData);
  }

  async logout(userId: number, clientId: string, bearerToken: string) {
    const userJobData: UserJobData = {
      userId,
      clientId,
      bearerToken: 'Bearer ' + bearerToken.substring(6),
    };
    this.statusQueue.add('logout', userJobData);
  }

  /**
   * [친구요청 프로세스]
   * 2. queue에 친구요청 작업을 추가한다.
   */
  async requestFriend(friendRequestJobData: FriendRequestJobData) {
    this.statusQueue.add('request-friend', friendRequestJobData);
  }

  async sendRequestFriendToUser(
    userId: number,
    clientId: string,
    bearerToken: string,
  ) {
    const userJobData: UserJobData = {
      userId,
      clientId,
      bearerToken: 'Bearer ' + bearerToken.substring(6),
    };
    this.statusQueue.add('send-request-friend-to-user', userJobData);
  }

  async acceptFriend(userId: number, clientId: string, bearerToken: string) {
    const userJobData: UserJobData = {
      userId,
      clientId,
      bearerToken: bearerToken.substring(6),
    };
    this.statusQueue.add('accept-friend', {});
  }
}
