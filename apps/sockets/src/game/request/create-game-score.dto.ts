import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateGameScoreRequestDto {
  @ApiProperty({
    description: '유저의 아이디',
    example: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '유저가 참여한 게임의 아이디',
    example: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  gameId: number;

  @ApiProperty({
    description: '유저의 게임 스코어',
    example: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  score: number;
}
