import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { CreateGroupChatDto } from './dto/create-chat.dto';
import { GetGroupChatListDto } from './dto/get-groupchatlist.dto';

@Injectable()
export class ChatGatewayService {
  private readonly restApiUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.restApiUrl = configService.get<string>('url.restApiUrl');
  }

  getSub(auth: string): number {
    if (auth == undefined) return null;
    auth = auth.split(' ')[1];
    const payload = this.jwtService.decode(auth);
    if (payload == null) {
      return null;
    } else return payload.sub;
  }

  login(userId: number, clientId: string, bearerToken: string) {
    axios.patch(
      `${this.restApiUrl}/user/${userId}`,
      {
        status: 'online',
        chatSocketId: clientId,
      },
      {
        headers: {
          Authorization: bearerToken,
        },
      },
    );
  }

  async getJoinedGroupChatList(
    userId: number,
    bearerToken: string,
  ): Promise<GetGroupChatListDto[]> {
    const response = await axios.get(
      `${this.restApiUrl}/chat/groupChatList/${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    );
    return response.data;
  }

  async getGroupChatList(): Promise<GroupChat> {
    const response = await axios.get(`${this.restApiUrl}/chat/groupChatList`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async createGroupChat(dto: CreateGroupChatDto): Promise<GroupChat> {
    const response = await axios.post(
      `${this.restApiUrl}/chat/groupChat`,
      dto,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }
}
