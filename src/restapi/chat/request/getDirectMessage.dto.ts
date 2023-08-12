import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetDirectMessageDto {
  @ApiProperty({
    description: '유저 아이디',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '상대방 아이디',
    example: 2,
  })
  @Type(() => Number)
  @IsNumber()
  targetId: number;
}
