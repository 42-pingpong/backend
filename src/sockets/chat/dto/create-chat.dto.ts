import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGroupChatDto {
  @IsString()
  chatName: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  levelOfPublicity: string;

  @Type(() => Number)
  @IsNumber()
  maxParticipants: number;

  @Type(() => Number)
  @IsNumber()
  ownerId: number;
}
