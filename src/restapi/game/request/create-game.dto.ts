import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class CreateGameDto {
  createDate: Date;

  @ApiProperty({
    description: '게임 맵 이미지',
    required: false,
    example: 'default',
  })
  @IsOptional()
  @IsString()
  gameMap?: string;
}
