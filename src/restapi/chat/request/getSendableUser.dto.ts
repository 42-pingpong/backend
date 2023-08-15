import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetSendableUserDto {
  @Type(() => Number)
  @IsNumber()
  senderId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  groupChatId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  requestedUserId?: number;
}
