import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetBanMuteListDto {
  @ApiProperty({
    description: '유저의 id',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;
}
