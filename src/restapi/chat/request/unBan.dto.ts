import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UnBanDto {
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @Type(() => Number)
  @IsNumber()
  requestUserId: number;
}
