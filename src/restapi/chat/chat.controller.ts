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
import { JoinGroupChatDto } from './dto/join-group-chat.dto';
import { BanDto } from './dto/ban.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('groupChatList')
  async getGroupChatList() {
    return await this.chatService.getGroupChatList();
  }

  /**
   * @param createChatDto
   * @description
   * - 그룹 채팅방을 생성하는 메서드
   */
  @ApiBody({ type: CreateGroupChatDto })
  @ApiCreatedResponse({ description: '그룹 채팅방 생성' })
  @Post('groupChat')
  async createGroupChat(@Body() createChatDto: CreateGroupChatDto) {
    return await this.chatService.createGroupChat(createChatDto);
  }

  /**
   * @param groupChatId
   * @returns groupChat
   * @description
   * - 그룹 채팅방의 정보를 반환하는 메서드
   */
  @Get('groupChat/:groupChatId')
  async getGroupChat(@Param('groupChatId') groupChatId: string) {
    // 그룹 채팅방의 정보를 반환하는 메서드
    return await this.chatService.getGroupChat(+groupChatId);
  }

  @Get('groupChat/:groupChatId/userList')
  async getGroupChatUsers(@Param('groupChatId') groupChatId: string) {
    return await this.chatService.getJoinedUserList(+groupChatId);
  }

  /**
   * @param groupChatId
   * @param updateGroupChatDto
   * @description
   * - 그룹 채팅방의 정보를 수정하는 메서드
   */
  @ApiBody({ type: UpdateGroupChatDto })
  @ApiCreatedResponse({ description: '그룹 채팅방 수정' })
  @Patch('groupChat/:groupChatId')
  async updateGroupChat(
    @Param('groupChatId') groupChatId: string,
    @Body() updateGroupChatDto: UpdateGroupChatDto,
  ) {
    // 그룹 채팅방의 정보를 수정하는 메서드
    await this.chatService.updateGroupChat(updateGroupChatDto, +groupChatId);
  }

  /**
   * @param groupChatId
   * @param query
   * @description
   * - 그룹 채팅방에 참여하는 메서드
   */
  @Post('groupChat/:groupChatId')
  async joinGroupChat(
    @Param('groupChatId') groupChatId: string,
    @Query() query: JoinGroupChatDto,
  ) {
    await this.chatService.joinGroupChat(+groupChatId, query);
  }

  /**
   * @param groupChatId
   * @param query
   * @description
   * - 그룹 채팅방의 admin을 추가하는 메서드
   */
  @Post('groupChat/:groupChatId/admin')
  async addAdmin(
    @Param('groupChatId') groupChatId: string,
    @Query() query: AddAdminDto,
  ) {
    await this.chatService.addAdmin(+groupChatId, query);
  }

  /**
   * @param groupChatId
   * @param query
   * @description
   * - 그룹 채팅방의 admin을 삭제하는 메서드
   */
  @Delete('groupChat/:groupChatId/admin')
  async deleteAdmin(
    @Param('groupChatId') groupChatId: string,
    @Query() query: DeleteAdminDto,
  ) {
    await this.chatService.deleteAdmin(+groupChatId, query);
  }

  /**
   *
   * @param groupChatId
   * @param userId
   * @description
   * - 그룹 채팅방에서 유저를 차단하는 메서드
   */
  @Post('groupChat/:groupChatId/ban')
  async ban(@Param('groupChatId') groupChatId: string, @Query() query: BanDto) {
    // 그룹 채팅방에서 유저를 차단하는 메서드
    await this.chatService.ban(+groupChatId, query);
  }

  // @Post('groupChat/:groupChatId/mute')
  // async mute(
  //   @Param('groupChatId') groupChatId: number,
  //   @Query('userId') userId: number,
  // ) {
  //   // 그룹 채팅방에서 유저를 뮤트하는 메서드
  //   this.chatService.mute(+groupChatId, userId);
  // }
}
