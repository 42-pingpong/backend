import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class KickUserDto {
  @Type(() => Number)
  @IsNumber()
  groupChatId: number;

  @Type(() => Number)
  @IsNumber()
  requestUserId: number;

  @Type(() => Number)
  @IsNumber()
  kickUserId: number;
}
