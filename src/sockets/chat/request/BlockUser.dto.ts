import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({
    description: '차단을 요청하는 유저의 아이디',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '차단을 당하는 유저의 아이디',
    example: 2,
  })
  @Type(() => Number)
  @IsNumber()
  blockedUserId: number;
}
