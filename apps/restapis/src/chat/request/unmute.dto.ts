import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UnMuteRequestDto {
  @ApiProperty({
    description: 'unmute할 유저의 id',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'unmute 요청한 유저의 id, owner/admin',
    example: 3,
  })
  @Type(() => Number)
  @IsNumber()
  requestUserId: number;
}
