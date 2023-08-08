import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateGroupChatDto {
  @IsString()
  chatName: string;

  @IsString()
  password: string;

  @IsString()
  levelOfPublicity: string;

  @Type(() => Number)
  @IsNumber()
  maxParticipants: number;

  @Type(() => Number)
  @IsNumber()
  ownerId: number;
}
