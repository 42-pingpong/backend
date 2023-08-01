import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRequestFriendDto {
  @ApiProperty({
    description: '요청한 유저의 아이디',
    example: 2,
  })
  @Type(() => Number)
  requestedUserId: number;
}
