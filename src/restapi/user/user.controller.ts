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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { AccessTokenGuard } from '../auth/Guards/accessToken.guard';
import { GetFriendResponseDto } from './dto/get-friend-response.dto';
import { AddFriendDto } from './dto/add-friend.dto';
import { GetFriendQueryDto } from './dto/get-friend-query.dto';
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
    type: GetFriendResponseDto,
  })
  @Get('/me/friends/:id')
  //need auth guard
  async getMyFriends(
    @Param('id') id: string,
    @Query() query: GetFriendQueryDto,
  ) {
    return await this.userService.getFriends(+id, query);
  }

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
