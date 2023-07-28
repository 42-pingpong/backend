import { Process, Processor } from '@nestjs/bull';
import axios from 'axios';
import { Job } from 'bull';
import { UpdateUserDto } from 'src/restapi/user/dto/update-user.dto';
import { UserJobData } from './interface/user.jobdata';

@Processor('status')
export class StatusConsumer {
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
      await axios.patch(
        `http://localhost:10002/api/user/${job.data.user.id}`,
        {
          status: 'online',
          socketId: job.data.clientId,
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

    //접속중인 친구목록에게 상태 업데이트 이벤트 보내기
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
  async logout(job: Job<unknown>) {
    console.log('logout');
    console.log(job.data);
  }
}
