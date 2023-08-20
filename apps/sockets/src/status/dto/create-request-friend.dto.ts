import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateRequestFriendDto {
  @ApiProperty({
    description: '요청한 유저의 아이디',
    example: 2,
  })
  @Type(() => Number)
  @IsNumber()
  requestedUserId: number;
}
