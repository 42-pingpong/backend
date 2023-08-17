import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class MuteRequestDto {
  @ApiProperty({
    description: 'mute할 유저의 id',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'mute 요청한 유저의 id, owner/admin',
    example: 3,
  })
  @Type(() => Number)
  @IsNumber()
  requestUserId: number;

  @ApiProperty({
    description: 'mute할 시간',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  time: number;

  @ApiProperty({
    description: 'mute할 시간의 단위',
    examples: ['s', 'm', 'h'],
  })
  @Type(() => String)
  @IsString()
  unit: string;
}
