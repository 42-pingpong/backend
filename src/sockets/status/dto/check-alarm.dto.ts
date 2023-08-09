import { IsNumber } from 'class-validator';

export class CheckAlarmDto {
  @IsNumber()
  requestId: number;
}
