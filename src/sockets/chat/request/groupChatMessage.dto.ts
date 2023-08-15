import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { MessageRequestDto } from './message.dto';

export class GroupChatMessageDto extends MessageRequestDto {
  @ApiProperty({
    description: '그룹채팅방의 id',
    example: 3,
  })
  @Type(() => Number)
  @IsNumber()
  receivedGroupChatId: number;
}
