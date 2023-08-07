import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GroupChat } from 'src/entities/chat/groupChat.entity';

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
    const response = await fetch(`${this.restApiUrl}/chat/groupChatList`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const groupChatList = await response.json();
    return groupChatList;
  }
}
