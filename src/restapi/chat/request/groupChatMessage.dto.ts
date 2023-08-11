import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { MessageRequestDto } from './message.dto';

export class GroupChatMessageDto extends MessageRequestDto {
  @ApiProperty({
    description: '그룹 채팅방의 아이디',
  })
  @IsNumber()
  groupChatId: number;
}
