import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WebSocketServer } from '@nestjs/websockets';
import axios from 'axios';
import { FriendRequestJobData, UserJobData } from 'src/interface/user.jobdata';
import { ChangeStatusData } from './status.gateway';

@Injectable()
export class StatusService {
  @WebSocketServer()
  server: any;

  private readonly restApiUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.restApiUrl = configService.get('url.restApiUrl');
  }

  getSub(auth: string): number {
    if (auth == undefined) return null;
    const bearer = auth.substring(6);
    console.log('bearer: ', bearer);
    const payload = this.jwtService.decode(bearer);
    console.log('payload: ', payload);
    if (payload == null) {
      return null;
    } else return payload.sub;
  }

  async login(sub: number, clientId: string, bearerToken: string) {
    console.log('status service login');
    console.log(sub, clientId, bearerToken);

    (bearerToken = 'Bearer ' + bearerToken.substring(6)), console.log('login');
    try {
      // status online으로 변경,
      // socketId 변경
      await axios.patch(
        `${this.restApiUrl}/user/${sub}`,
        {
          status: 'online',
          statusSocketId: clientId,
        },
        {
          headers: {
            Authorization: bearerToken,
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
        `${this.restApiUrl}/user/me/friends/${sub}?status=online`,
        {
          headers: {
            Authorization: bearerToken,
          },
        },
      );
      console.log('response.data', response.data);

      const me = await axios.get(`${this.restApiUrl}/user/me`, {
        headers: {
          Authorization: bearerToken,
        },
      });

      this.server.emit(
        'change-status',
        JSON.stringify({ friendList: response.data, me: me.data }),
      );
      //소켓 서버에게 상태 업데이트 이벤트 보내기
      //접속중인 친구목록을 줌.
    } catch (error) {
      console.log(error);
    }
  }

  async changeStatus(changeStatusData: ChangeStatusData) {
    for (const friend of changeStatusData.friendList) {
      // 온라인 친구에게 로그인/로그아웃한 유저의 상태정보를 전송한다.
      console.log('change-status', friend.statusSocketId, changeStatusData.me);
      this.server
        .to(friend.statusSocketId)
        .emit('change-status', changeStatusData.me);
    }
  }

  async disconnect(sub: number, clientId: string, bearerToken: string) {
    console.log('logout');
    //1. 로그아웃 시, 로그인 상태/연결된 소켓 정보를 삭제한다.
    try {
      const res = await axios.patch(
        `${this.restApiUrl}/user/${sub}`,
        {
          status: 'offline',
          statusSocketId: null,
        },
        {
          headers: {
            Authorization: bearerToken,
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
        `${this.restApiUrl}/user/me/friends/${sub}?status=online`,
        {
          headers: {
            Authorization: bearerToken,
          },
        },
      );

      const me = await axios.get(`${this.restApiUrl}/user/me`, {
        headers: {
          Authorization: bearerToken,
        },
      });

      this.server.emit(
        'change-status',
        JSON.stringify({ friendList: response.data, me: me.data }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async requestFriend(requestFriendJobData: FriendRequestJobData) {
    try {
      const saved = await axios.post(
        `${this.restApiUrl}/user/me/friend/request/${requestFriendJobData.userId}`,
        requestFriendJobData.friendRequestBody,
      );
    } catch (e) {}
  }

  async sendRequestFriendToUser(
    sub: number,
    clientId: string,
    bearerToken: string,
  ) {}

  async acceptFriend(sub: number, clientId: string, bearerToken: string) {}
}
