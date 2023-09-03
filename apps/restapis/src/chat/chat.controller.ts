import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';
import { AddAdminDto } from './dto/add-admin.dto';
import { DeleteAdminDto } from './dto/delete-admin.dto';
import { JoinGroupChatDto } from './dto/join-group-chat.dto';
import { BanDto } from './dto/ban.dto';
import { GetGroupChatListDto } from './dto/get-groupchatlist.dto';
import { GroupChatMessageDto } from './request/groupChatMessage.dto';
import { MuteRequestDto } from './request/mute.dto';
import { DirectMessageDto } from './request/DirectMessage.dto';
import { GroupChatMessageResponse } from './response/groupChatMessage.response';
import { DirectMessageResponse } from './response/directMessage.response';
import { GetDirectMessageDto } from './request/getDirectMessage.dto';
import { GetGroupMessageDto } from './request/getGroupMessage.dto';
import { BlockRequestDto } from './request/block.request.dto';
import { UnBlockRequestDto } from './request/unBlock.request.dto';
import { UnMuteRequestDto } from './request/unmute.dto';
import { UnBanDto } from './request/unBan.dto';
import { KickUserDto } from './request/kickUser.dto';
import { GetBanMuteListDto } from './request/getBanMuteList.dto';
import { GetMuteOffsetDto } from './request/getMuteOffset.dto';
import { Request } from 'express';
import { BanMuteList } from './response/BanMuteList.dto';
import { MuteOffsetDto } from './response/MuteOffset.dto';
import { AccessTokenGuard } from '@app/common';

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
  @ApiOperation({
    summary: '그룹 채팅방의 정보를 반환하는 메서드',
  })
  @ApiParam({
    name: 'groupChatId',
    description: '그룹 채팅방의 id',
  })
  @Get('groupChat/:groupChatId')
  async getGroupChat(@Param('groupChatId') groupChatId: string) {
    // 그룹 채팅방의 정보를 반환하는 메서드
    return await this.chatService.getGroupChat(+groupChatId);
  }

  /**
   * @param groupChatId
   * @description
   * - 그룹 채팅방에 참여한 유저들의 정보를 반환하는 메서드
   */
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
  //need Auth Guard
  async joinGroupChat(
    @Param('groupChatId') groupChatId: string,
    @Query() query: JoinGroupChatDto,
  ) {
    return await this.chatService.joinGroupChat(+groupChatId, query);
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
   * @param userId
   * @description
   * - 유저가 참여한 모든 그룹 채팅방의 정보를 반환하는 메서드
   **/
  @ApiOperation({ summary: '유저가 참여한 모든 그룹 채팅방의 정보를 반환' })
  @ApiOkResponse({
    description: '유저가 참여한 모든 그룹 채팅방의 정보를 반환',
    type: GetGroupChatListDto,
    isArray: true,
  })
  @Get('groupChatList/:userId')
  async getJoinedGroupChatList(@Param('userId') userId: string) {
    return await this.chatService.getJoinedGroupChatList(+userId);
  }

  @ApiOperation({ summary: '그룹 채팅방에서 메시지를 보내는 메서드' })
  @ApiCreatedResponse({
    description: '그룹 채팅방에서 메시지를 보냄',
    type: GroupChatMessageResponse,
  })
  @Post('groupChat/messages/send')
  async sendGroupMessage(@Body() message: GroupChatMessageDto) {
    return await this.chatService.sendGroupMessage(message);
  }

  @ApiOperation({ summary: '게인 메시지를 보내는 메서드' })
  @ApiCreatedResponse({
    description: '게인 메시지를 보냄',
    type: DirectMessageResponse,
  })
  @Post('messages')
  async sendDirectMessage(@Body() message: DirectMessageDto) {
    return await this.chatService.sendDirectMessage(message);
  }

  @ApiOkResponse({
    description: 'Direct Message를 받아옴.',
    type: DirectMessageResponse,
    isArray: true,
  })
  @Get('directMessages')
  //need auth guard
  async getDirectMessages(@Query() query: GetDirectMessageDto) {
    return await this.chatService.getDirectMessage(query);
  }

  @ApiOkResponse({
    description: 'Group Message를 받아옴.',
    type: GroupChatMessageResponse,
    isArray: true,
  })
  @Get('groupMessages')
  //need auth guard
  async getGroupMessages(@Query() query: GetGroupMessageDto) {
    return await this.chatService.getGroupChatMessages(query);
  }

  @Post('block')
  async block(@Body() body: BlockRequestDto) {
    await this.chatService.blockUser(body);
  }

  @Delete('unBlock')
  async unblock(@Body() body: UnBlockRequestDto) {
    await this.chatService.unBlockUser(body);
  }

  @ApiOperation({
    summary: '그룹 채팅방에서 유저를 차단하는 메서드',
  })
  @Post('groupChat/mute/:groupChatId')
  async mute(
    @Param('groupChatId') groupChatId: string,
    @Body() body: MuteRequestDto,
  ) {
    // 그룹 채팅방에서 유저를 뮤트하는 메서드
    return await this.chatService.mute(body, +groupChatId);
  }

  @ApiOperation({
    summary: '그룹 채팅방에서 유저를 뮤트해제하는 메서드',
  })
  @Post('groupChat/unmute/:groupChatId')
  async unmute(
    @Param('groupChatId') groupChatId: string,
    @Body() body: UnMuteRequestDto,
  ) {
    // 그룹 채팅방에서 유저를 뮤트해제하는 메서드
    return await this.chatService.unMute(body, +groupChatId);
  }

  @ApiOperation({
    summary: '그룹 채팅방에서 유저를 차단하는 메서드',
  })
  @Post('groupChat/:groupChatId/ban')
  async ban(@Param('groupChatId') groupChatId: string, @Body() body: BanDto) {
    // 그룹 채팅방에서 유저를 차단하는 메서드
    return await this.chatService.ban(+groupChatId, body);
  }

  @ApiOperation({
    summary: '그룹 채팅방에서 유저를 차단해제하는 메서드',
  })
  @Post('groupChat/:groupChatId/unBan')
  async unBan(
    @Param('groupChatId') groupChatId: string,
    @Body() body: UnBanDto,
  ) {
    // 그룹 채팅방에서 유저를 차단하는 메서드
    return await this.chatService.unBan(+groupChatId, body);
  }

  @Post('groupChat/kick/:groupChatId')
  async kick(
    @Param('groupChatId') groupChatId: string,
    @Body() body: KickUserDto,
  ) {
    return await this.chatService.kickUser(+groupChatId, body);
  }

  @ApiOperation({
    summary: '그룹 채팅방의 밴/뮤트 유저 리스트를 반환하는 메서드',
    description: '그룹 채팅방의 밴/뮤트 유저 리스트를 반환하는 메서드',
  })
  @ApiOkResponse({
    description: '그룹 채팅방의 밴/뮤트 유저 리스트를 반환하는 메서드',
    type: BanMuteList,
    isArray: true,
  })
  // @UseGuards(AccessTokenGuard)
  @Get('groupChat/:groupChatId/banMuteList')
  async getBanMuteList(
    @Req() req: Request,
    @Param('groupChatId') groupChatId: string,
    @Query() dto: GetBanMuteListDto,
  ) {
    // if (+req.user.sub !== dto.userId) {
    //   throw new ForbiddenException('권한이 없습니다.');
    // }
    return await this.chatService.getBanMuteList(+groupChatId, dto);
  }

  @ApiOperation({
    summary: '유저의 그룹채팅방 내에서 mute offset을 반환하는 메서드',
  })
  @ApiOkResponse({
    description: '유저의 그룹채팅방 내에서 mute offset을 반환하는 메서드',
    type: MuteOffsetDto,
  })
  @ApiParam({
    name: 'groupChatId',
    description: '그룹 채팅방의 id',
    example: 1,
  })
  @UseGuards(AccessTokenGuard)
  @Get('groupChat/:groupChatId/muteOffset')
  async getMuteOffset(
    @Req() req: Request,
    @Param('groupChatId') groupChatId: string,
    @Query() dto: GetMuteOffsetDto,
  ) {
    // if (+req.user.sub !== dto.userId) {
    //   throw new ForbiddenException('권한이 없습니다.');
    // }
    return await this.chatService.getMuteOffset(+groupChatId, dto);
  }

  @Get('groupChat/:groupChatId/sendable')
  @UseGuards(AccessTokenGuard)
  async getSendable(
    @Req() req: Request,
    @Param('groupChatId') groupChatId: string,
  ) {
    return await this.chatService.getSendableGroupChatUserList(
      +req.user.sub,
      +groupChatId,
    );
  }
}
