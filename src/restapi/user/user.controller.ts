import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { AccessTokenGuard } from '../auth/Guards/accessToken.guard';
import { AddFriendDto } from './dto/add-friend.dto';
import { GetFriendQueryDto } from './dto/get-friend-query.dto';
import { CreateRequestFriendDto } from './dto/create-request-friend.dto';
import { GetFriendResponse } from './response/get-friend.response';
import { SearchUserDto } from './dto/search-user.dto';
import { SearchUserResponseDto } from './dto/search-user-response.dto';
import { GetUserResponseDto } from './response/get-alarm.response';
import { PostRequestResponseDto } from './response/post-request-response';
import { RequestAcceptDto } from './dto/request-accept.dto';
import { RequestRejectDto } from './dto/request-reject.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // id -> nickname
  @ApiOperation({
    summary: 'get user nickname',
    description: '유저 닉네임 조회',
  })
  @ApiResponse({
    status: 200,
    type: String,
  })
  @ApiParam({ name: 'id', type: String })
  @Get('/nick/:id')
  async getNickname(@Param('id') id: string) {
    return await this.userService.getNickname(+id);
  }

  @ApiOperation({
    summary: 'get user info',
    description: '유저 정보 조회(공개)',
  })
  @Get('/public/:id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findPublicOne(+id);
  }

  @ApiOperation({
    summary: 'get my info(profile)',
    description: '내 정보 조회',
  })
  @ApiResponse({
    status: 200,
    type: CreateUserDto,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/me')
  async getMe(@Req() req: Request) {
    // req.sessionStore.get(req.sessionID, (err, session) => console.log(session));
    return await this.userService.findOne(+req.user.sub);
  }

  @ApiBody({ type: UpdateUserDto })
  @ApiParam({ name: 'id', type: String })
  @ApiConflictResponse({ description: '닉네임 중복 || 이메일 중복' })
  @Patch(':id')
  //need auth guard
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.userService.update(+id, updateUserDto);
  }

  @ApiOperation({
    summary: 'get my friends',
    description: '내 친구 조회',
  })
  @ApiResponse({
    status: 200,
    type: GetFriendResponse,
    isArray: true,
  })
  @Get('/me/friends/:id')
  //need auth guard
  async getMyFriends(
    @Param('id') id: string,
    @Query() query: GetFriendQueryDto,
  ) {
    return await this.userService.getFriends(+id, query);
  }

  /**
   * @deprecated not completed
   * */
  @ApiOperation({
    summary: '친구 추가',
    description: '친구 추가',
  })
  @ApiBody({ type: AddFriendDto })
  @Post('/me/friends/:id')
  //need auth guard
  async addFriend(@Param('id') id: string, @Body() friend: AddFriendDto) {
    return await this.userService.addFriend(+id, friend.friendId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: '친구 요청 수락',
    description: '친구 요청 수락',
  })
  @Patch('/me/friend/request/accept')
  async acceptRequest(@Body() body: RequestAcceptDto, @Req() req: Request) {
    return await this.userService.acceptFriendRequest(+req.user.sub, body);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/me/friend/request/reject')
  //need auth guard
  async rejectRequest(@Body() body: RequestRejectDto, @Req() req: Request) {
    return await this.userService.rejectFriendRequest(+req.user.sub, body);
  }

  /**
   * @description 친구 요청 생성
   * @description 친구요청 과정
   * 1. Status socket통해 request-friend 요청 알림.
   * 2-1. 해당 유저가 로그인 상태라면, socket통해 요청 알림.
   * 	- 소켓통해 알람된 요청은 테이블에 PENDING 상태로 저장.
   * 2-2. 해당 유저가 로그인 상태가 아니라면, DB에 저장.
   * 	- 소켓통해 알람되지 않은 요청은 테이블에 NOTALARMED 상태로 저장.
   * 	- 이후, 로그인 시 알람되지 않은 요청을 알람.
   * */
  @ApiOperation({
    summary: '친구 요청 생성',
    description: '친구 요청 생성',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '1',
    description: '친구 요청을 하는 유저 id',
  })
  @ApiCreatedResponse({
    type: PostRequestResponseDto,
  })
  @Post('/me/friend/request/:id')
  //need auth guard
  async requestFriend(
    @Param('id') id: string,
    @Body() friend: CreateRequestFriendDto,
  ) {
    return await this.userService.saveRequestFriend(
      +id,
      friend.requestedUserId,
    );
  }

  @ApiOperation({
    summary: '유저 검색',
    description: '유저 검색',
  })
  @ApiResponse({
    status: 200,
    type: SearchUserResponseDto,
  })
  @Get('/search')
  async searchUser(@Query() query: SearchUserDto) {
    return await this.userService.searchUser(query);
  }

  @ApiOperation({
    summary: '유저의 모든 받은 요청 조회',
    description: '받은요청(알람) 조회',
  })
  @ApiOkResponse({
    type: GetUserResponseDto,
    isArray: true,
  })
  // @UseGuards(AccessTokenGuard)
  @Get('/alarms/:id')
  async getAlarms(@Req() req: Request, @Param('id') id: string) {
    return await this.userService.getAlarms(+id);
  }

  /**
   * @description userId의 모든 알람 상태 PENDING으로 변경
   * */
  @ApiExcludeEndpoint()
  @Patch('/alarms/:userId')
  async checkAlarms(@Param('userId') userId: string) {
    return await this.userService.checkAlarmsOfUser(+userId);
  }
}
