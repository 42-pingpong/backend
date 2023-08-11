import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class MessageRequestDto {
  @ApiProperty({
    description: '메시지 내용',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: '보내는 사람의 아이디',
  })
  @IsNumber()
  senderId: number;
}
