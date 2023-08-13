import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UnblockUserDto {
  @ApiProperty({
    description: '차단해제를 요청하는 유저의 아이디',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '차단해제를 당하는 유저의 아이디',
    example: 2,
  })
  @Type(() => Number)
  @IsNumber()
  unBlockedUserId: number;
}
