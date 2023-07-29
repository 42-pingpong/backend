import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('groupChat/:groupChatId')
  getGroupChat(@Param('groupChatId') groupChatId: string) {
    // 그룹 채팅방의 정보를 반환하는 메서드
    return this.chatService.getGroupChat(+groupChatId);
  }

  @ApiBody({ type: CreateGroupChatDto })
  @ApiCreatedResponse({ description: '그룹 채팅방 생성' })
  @Post('groupChat')
  createGroupChat(@Body() createChatDto: CreateGroupChatDto) {
    // 그룹 채팅방을 생성하는 메서드
    this.chatService.createGroupChat(createChatDto);
  }

  @Post()
  sendMessage(@Body() message: string): void {
    // 클라이언트로부터 채팅 메시지를 받아와서 처리하는 메서드
    this.chatService.sendMessage(message);
  }

  @Get()
  getAllMessages() {
    // 모든 채팅 메시지를 반환하는 메서드
    return this.chatService.getAllMessages();
  }
}

