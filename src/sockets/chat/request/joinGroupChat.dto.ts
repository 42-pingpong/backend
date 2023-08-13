import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class JoinGroupChatDto {
  groupChatId: number;
  userId: number;
  password?: string;
}
