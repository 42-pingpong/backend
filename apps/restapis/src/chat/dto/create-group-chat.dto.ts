import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGroupChatDto {
  @ApiProperty({
    type: String,
    description: '채팅방 이름',
    example: '트센 채팅방',
  })
  @IsString()
  chatName: string;

  @ApiProperty({
    type: String,
    description: '채팅방 비밀번호',
    example: '1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    type: String,
    description: '채팅방 공개 여부',
    example: 'Prot',
    enum: ['Pub', 'Prot'],
  })
  @IsString()
  levelOfPublicity: string;

  @ApiProperty({
    type: Number,
    description: '채팅방 최대 인원',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  maxParticipants: number;

  @ApiProperty({
    type: Number,
    description: '채팅방 소유자Id',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  ownerId: number;

  @ApiProperty({
    type: Number,
    isArray: true,
    description: '채팅방 참여자Id',
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsNumber({}, { each: true })
  participants?: number[];
}
