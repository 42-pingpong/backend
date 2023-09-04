import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetGroupMessageDto {
  @ApiProperty({
    description: '그룹 채팅방 아이디',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  groupChatId: number;

  @ApiProperty({
    description: '유저 아이디',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;
}
