import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
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
    console.log(req.session.id);
    return await this.userService.findOne(req.user.id);
  }

  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(+id);
  }

  @ApiBody({ type: UpdateUserDto })
  @ApiParam({ name: 'id', type: String })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    await this.userService.update(+id, updateUserDto);
  }
}
