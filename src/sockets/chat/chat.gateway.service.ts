import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { CreateGroupChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatGatewayService {
  private readonly restApiUrl: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.restApiUrl = configService.get<string>('url.restApiUrl');
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
