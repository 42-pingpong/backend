import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KickUserDto {
  @ApiProperty({
    description: '유저 아이디 Admin/Owner만 가능',
    example: 10000,
  })
  @Type(() => Number)
  @IsNumber()
  requestUserId: number;

  @ApiProperty({
    description: '킥할 유저 아이디',
    example: 10002,
  })
  @Type(() => Number)
  @IsNumber()
  kickUserId: number;
}
