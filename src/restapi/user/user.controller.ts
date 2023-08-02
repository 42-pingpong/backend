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


@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  @Post('/me/friend/request/:id')
  async requestFriend(
    @Param('id') id: string,
    @Body() friend: CreateRequestFriendDto,
  ) {
    return await this.userService.saveRequestFriend(
      +id,
      friend.requestedUserId,
    );

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
    console.log('query: ', query);
    return await this.userService.searchUser(query);
  }
}
