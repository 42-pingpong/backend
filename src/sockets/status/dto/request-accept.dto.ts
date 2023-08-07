import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class RequestAcceptDto {
  @Type(() => Number)
  @IsNumber()
  requestId: number;
}
