import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { MessageRequestDto } from './message.dto';

export class DirectMessageDto extends MessageRequestDto {
  @ApiProperty({
    description: '받는 사람의 id',
    example: 3,
  })
  @Type(() => Number)
  @IsNumber()
  receiverId: number;
}
