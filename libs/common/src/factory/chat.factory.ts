import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class CreateGroupChatDto {
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

export class ChatFactory {
  /**
   * @brief Creates a chat with the given owner and identifier
   *
   * @param ownerId number, 소유자의 아이디
   * @param id number, 채팅방 프로퍼티에 붙일 id
   */
  createPubChat(ownerId: number, id: number): CreateGroupChatDto {
    const newChat = new CreateGroupChatDto();

    newChat.chatName = 'Test Chat' + id;
    newChat.levelOfPublicity = 'Pub';
    newChat.maxParticipants = 4;
    newChat.ownerId = ownerId;

    return newChat;
  }

  createPrivChat(ownerId: number, id: number): CreateGroupChatDto {
    const newChat = new CreateGroupChatDto();

    newChat.chatName = 'Test Chat' + id;
    newChat.levelOfPublicity = 'Prot';
    newChat.maxParticipants = 4;
    newChat.ownerId = ownerId;

    return newChat;
  }
}
