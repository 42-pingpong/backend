import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class BanDto {
  @ApiProperty({
    description: 'ban을 요청하는 유저 아이디',
    example: 101234,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'ban을 당하는 유저 아이디',
    example: 101235,
  })
  @Type(() => Number)
  @IsNumber()
  bannedId: number;
}
