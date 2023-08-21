import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGameDto {
  @ApiProperty({
    description: '게임 맵 이미지',
    required: false,
    example: 'default',
  })
  @IsOptional()
  @IsString()
  gameMap?: string;
}
