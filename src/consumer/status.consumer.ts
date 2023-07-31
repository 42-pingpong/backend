import { Process, Processor } from '@nestjs/bull';
import axios from 'axios';
import { Job } from 'bull';
import { UserJobData } from 'src/interface/user.jobdata';
import { io } from 'socket.io-client';
import { ConfigService } from '@nestjs/config';

@Processor('status')
export class StatusConsumer {
  private readonly StatusSocket;
  private readonly restApiUrl;
  private readonly statusServerUrl;

  constructor(private readonly configService: ConfigService) {
    this.restApiUrl = configService.get('url.restApiUrl');
    this.statusServerUrl = configService.get('url.statusServerUrl');
    this.StatusSocket = io(this.statusServerUrl, {
      transports: ['websocket'],
      autoConnect: false,
      auth: {
        server: 'true',
      },
    });
    this.StatusSocket.connect();
  }
  /**
   * 1. 로그인 시, 로그인 상태/연결된 소켓 정보를 저장한다.
   * 2. 친구목록에서, 로그인 상태 유저 소켓들에게 상태 업데이트 이벤트를 보낸다.
   * @description - This method is called when a job is added to the queue
   * @param {Job<unknown>} job
   * @returns {Promise<void>}
   * @memberof StatusConsumer
   * */
  @Process('login')
  async login(job: Job<UserJobData>) {
    console.log('login');
    console.log(job.data);
    try {
      // status online으로 변경,
      // socketId 변경
      await axios.patch(
        `${this.restApiUrl}/user/${job.data.userId}`,
        {
          status: 'online',
          statusSocketId: job.data.clientId,
        },
        {
          headers: {
            Authorization: job.data.bearerToken,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
    //접속중인 친구목록 가져오기
    //GET /user/friends/:id
    try {
      const response = await axios.get(
        `${this.restApiUrl}/user/me/friends/${job.data.userId}?status=online&includeMe=true`,
        {
          headers: {
            Authorization: job.data.bearerToken,
          },
        },
      );
      console.log('response.data', response.data);
      this.StatusSocket.emit('change-status', JSON.stringify(response.data));
      //접속중인 친구목록에게 상태 업데이트 이벤트 보내기
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 1. 로그아웃 시, 로그인 상태/연결된 소켓 정보를 삭제한다.
   * 2. 친구목록에서, 로그인 상태 유저 소켓들에게 상태 업데이트 이벤트를 보낸다.
   * @description - This method is called when a job is added to the queue
   * @param {Job<unknown>} job
   * @returns {Promise<void>}
   * @memberof StatusConsumer
   * */
  @Process('logout')
  async logout(job: Job<UserJobData>) {
    console.log('logout');
    console.log(job.data);
    //1. 로그아웃 시, 로그인 상태/연결된 소켓 정보를 삭제한다.
    try {
      const res = await axios.patch(
        `${this.restApiUrl}/api/user/${job.data.userId}`,
        {
          status: 'offline',
          statusSocketId: null,
        },
        {
          headers: {
            Authorization: job.data.bearerToken,
          },
        },
      );
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }

    //2. 친구목록에서, 로그인 상태 유저 소켓들에게 상태 업데이트 이벤트를 보낸다.
    try {
      const response = await axios.get(
        `${this.restApiUrl}/user/me/friends/${job.data.userId}?status=online&includeMe=true`,
        {
          headers: {
            Authorization: job.data.bearerToken,
          },
        },
      );
      console.log('response.data', response.data);
      this.StatusSocket.emit('change-status', JSON.stringify(response.data));
    } catch (error) {
      console.log(error);
    }
  }
}
