import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class RequestRejectDto {
  @Type(() => Number)
  @IsNumber()
  requestId: number;
}
