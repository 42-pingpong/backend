import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class AddFriendDto {
  @ApiProperty({
    description: '친구 추가할 유저의 id',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  friendId: number;
}
