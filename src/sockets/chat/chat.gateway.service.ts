import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { CreateGroupChatDto } from './dto/create-chat.dto';
import { GetGroupChatListDto } from './dto/get-groupchatlist.dto';
import { JoinGroupChatDto } from './dto/join-group-chat.dto';
import { DirectMessageDto } from './request/directMessage.dto';
import { FetchDirectMessageDto } from './request/FetchDirectMessage.dto';
import { FetchGroupMessageDto } from './request/FetchGroupChatMessage.dto';
import { GroupChatMessageDto } from './request/groupChatMessage.dto';
import { FetchDirectMessageResponseDto } from './restApiResponse/FetchDirectMessageResponse.dto';
import { FetchGroupChatMessageResponseDto } from './restApiResponse/FetchGroupChatMessageResponse.dto';

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

  async login(userId: number, clientId: string, bearerToken: string) {
    try {
      await axios.patch(
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
    } catch (error) {}
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
          Authorization: bearerToken,
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

  async joinGroupChat(
    groupChatId: number,
    userId: number,
    bearerToken: string,
  ) {
    await axios.post(
      `${this.restApiUrl}/chat/groupChat/${groupChatId}?userId=${userId}`,
      {
        headers: {
          Authorization: bearerToken,
        },
      },
    );
  }

  async saveGroupChatMessage(dto: GroupChatMessageDto, bearerToken: string) {
    const res = await axios.post(
      `${this.restApiUrl}/chat/groupChat/messages/send`,
      dto,
      {
        headers: {
          Authorization: bearerToken,
        },
      },
    );
    return res.data;
  }

  async saveDirectMessage(dto: DirectMessageDto, bearerToken: string) {
    const res = await axios.post(`${this.restApiUrl}/chat/messages`, dto, {
      headers: {
        Authorization: bearerToken,
      },
    });
    return res.data;
  }

  async fetchGroupMessage(
    dto: FetchGroupMessageDto,
    bearerToken: string,
  ): Promise<FetchGroupChatMessageResponseDto> {
    const res = await axios.get(
      `${this.restApiUrl}/chat/groupMessages?groupChatId=${dto.groupChatId}&userId=${dto.userId}`,
      {
        headers: {
          Authorization: bearerToken,
        },
      },
    );
    return res.data;
  }

  async fetchDirectMessage(
    dto: FetchDirectMessageDto,
    bearerToken: string,
  ): Promise<FetchDirectMessageResponseDto> {
    const res = await axios.get(
      `${this.restApiUrl}/chat/directMessages?userId=${dto.userId}&targetId=${dto.targetId}`,
      {
        headers: {
          Authorization: bearerToken,
        },
      },
    );

    return res.data;
  }
}
