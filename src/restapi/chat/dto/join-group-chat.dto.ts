import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class JoinGroupChatDto {
  @ApiProperty({
    description: '그룹 채팅방에 참여하고자 하는 유저 아이디',
    example: 101234,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '그룹 채팅방에 비밀번호',
    example: '1234',
    required: false,
  })
  @IsOptional()
  @Type(() => String)
  password?: string;
}
