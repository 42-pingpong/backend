import { IsNumber, IsString } from 'class-validator';

export class SendMailDto {
  @IsNumber()
  userId: number;

  @IsString()
  nickName: string;

  @IsString()
  mailAddress: string;
}
