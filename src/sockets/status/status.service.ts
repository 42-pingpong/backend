import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WebSocketServer } from '@nestjs/websockets';
import axios from 'axios';
import { FriendRequestJobData } from 'src/interface/user.jobdata';
import { PostRequestResponseDto } from 'src/restapi/user/response/post-request-response';

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
    auth = auth.split(' ')[1];
    const payload = this.jwtService.decode(auth);
    if (payload == null) {
      return null;
    } else return payload.sub;
  }

  async login(sub: number, clientId: string, bearerToken: string) {
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

      const me = await axios.get(`${this.restApiUrl}/user/me`, {
        headers: {
          Authorization: bearerToken,
        },
      });

      return {
        friendList: response.data,
        me: me.data,
      };
      //소켓 서버에게 상태 업데이트 이벤트 보내기
      //접속중인 친구목록을 줌.
    } catch (error) {
      console.log(error);
    }
  }

  async disconnect(sub: number, clientId: string, bearerToken: string) {
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
      return {
        friendList: response.data,
        me: me.data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async postRequestFriend(
    requestFriendJobData: FriendRequestJobData,
  ): Promise<PostRequestResponseDto> {
    //1. request save
    try {
      const request = await axios.post(
        `${this.restApiUrl}/user/me/friend/request/${requestFriendJobData.userId}`,
        requestFriendJobData.friendRequestBody,
        {
          headers: {
            Authorization: requestFriendJobData.bearerToken,
          },
        },
      );
      return request.data;
    } catch (error) {
      return null;
    }
  }

  async checkAlarm(sub: number, clientId: string, bearerToken: string) {
    //sub의 모든 alarm을 PENDING으로 변경

    try {
      await axios.patch(`${this.restApiUrl}/user/alarms/${sub}`, {
        headers: {
          Authorization: bearerToken,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async acceptFriend(sub: number, clientId: string, bearerToken: string) {}
}
