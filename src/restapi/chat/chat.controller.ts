import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { AddAdminDto } from './dto/add-admin.dto';
import { DeleteAdminDto } from './dto/delete-admin.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('groupChat/:groupChatId')
  async getGroupChat(@Param('groupChatId') groupChatId: string) {
    // 그룹 채팅방의 정보를 반환하는 메서드
    return this.chatService.getGroupChat(+groupChatId);
  }

  @ApiBody({ type: CreateGroupChatDto })
  @ApiCreatedResponse({ description: '그룹 채팅방 생성' })
  @Post('groupChat')
  async createGroupChat(@Body() createChatDto: CreateGroupChatDto) {
    // 그룹 채팅방을 생성하는 메서드
    this.chatService.createGroupChat(createChatDto);
  }

  @ApiBody({ type: UpdateGroupChatDto })
  @ApiCreatedResponse({ description: '그룹 채팅방 수정' })
  @Patch('groupChat/:groupChatId')
  async updateGroupChat(
    @Param('groupChatId') groupChatId: string,
    @Body() updateGroupChatDto: UpdateGroupChatDto,
  ) {
    // 그룹 채팅방의 정보를 수정하는 메서드
    this.chatService.updateGroupChat(updateGroupChatDto, +groupChatId);
  }

  @Post('groupChat/:groupChatId/admin')
  async addAdmin(
    @Param('groupChatId') groupChatId: string,
    @Query() query: AddAdminDto,
  ) {
    // 그룹 채팅방에 admin(id)을 추가하는 메서드
    // this.chatService.addAdmin(+groupChatId, req.user.userId, id);
    await this.chatService.addAdmin(+groupChatId, query);
  }

  @Delete('groupChat/:groupChatId/admin')
  async deleteAdmin(
    @Param('groupChatId') groupChatId: string,
    @Query() query: DeleteAdminDto,
  ) {
    // 그룹 채팅방에서 admin을 삭제하는 메서드
    await this.chatService.deleteAdmin(+groupChatId, query);
  }

  ///////////////////////////////////////////////////////////////

  @Post('groupChat/:groupChatId/ban')
  async ban(
    @Param('groupChatId') groupChatId: number,
    @Query('userId') userId: number,
  ) {
    // 그룹 채팅방에서 유저를 차단하는 메서드
    this.chatService.ban(+groupChatId, userId);
  }

  // @Post('groupChat/:groupChatId/setpriv')
  // async setPriv(
  //   @Param('groupChatId') groupChatId: number,
  //   @Query() query: SetPrivDto,
  // ) {
  //   // 그룹 채팅방을 비공개로 설정하는 메서드
  //   this.chatService.setPriv(+groupChatId, levelOfPublicity);
  // }

  // @Post('groupChat/:groupChatId/setpub')
  // async setPub(
  //   @Param('groupChatId') groupChatId: number,
  //   @Query() levelOfPublicity: number,
  // ) {
  //   // 그룹 채팅방을 공개로 설정하는 메서드
  //   this.chatService.setPub(+groupChatId, levelOfPublicity);
  // }

  // mute table 존재 x
  // @Post('groupChat/:groupChatId/mute')
  // async mute(
  //   @Param('groupChatId') groupChatId: number,
  //   @Query('userId') userId: number,
  // ) {
  //   // 그룹 채팅방에서 유저를 뮤트하는 메서드
  //   this.chatService.mute(+groupChatId, userId);
  // }
}
