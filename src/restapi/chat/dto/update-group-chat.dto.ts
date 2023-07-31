import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupChatDto } from './create-group-chat.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UpdateGroupChatDto extends PartialType(CreateGroupChatDto) {
  // 그룹 채팅방 정보를 수정하는 DTO
  @ApiProperty({
    type: String,
    description: '채팅방 비밀번호',
    example: '1234',
  })
  @IsString()
  password?: string;

  @ApiProperty({
    type: String,
    description: '채팅방 공개 여부',
    example: 'Priv',
    enum: ['Pub', 'Priv'],
  })
  @IsString()
  levelOfPublicity?: string;

  @ApiProperty({
    type: Number,
    description: '채팅방 최대 인원',
    example: 10,
  })
  @IsNumber()
  maxParticipants?: number;
}
