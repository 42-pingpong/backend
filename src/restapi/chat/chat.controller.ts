import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { WebSocketServer } from '@nestjs/websockets';


@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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