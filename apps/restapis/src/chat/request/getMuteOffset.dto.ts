import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetMuteOffsetDto {
  @ApiProperty({
    description: '유저의 id',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;
}
