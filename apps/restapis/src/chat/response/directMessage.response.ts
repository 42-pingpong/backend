import { ApiProperty } from '@nestjs/swagger';
import { MessageInfo } from '@app/common/entities/messageInfo.entity';
import { User } from '@app/common/entities/user.entity';

export class DirectMessageResponse {
  @ApiProperty({
    description: '해당 Direct 메세지의 아이디',
    example: 1,
  })
  directMessageId: number;

  @ApiProperty({
    description: '메세지를 받을 유저의 아이디',
    example: 1,
  })
  receivedUserId: number;

  @ApiProperty({
    description: '메세지 받을 유저',
    example: {
      chatSocketId: 'socketId',
    },
  })
  receivedUser: User;

  @ApiProperty({
    description: '메세지의 정보',
    example: {
      messageId: 1,
      message: '안녕하세요',
      createdAt: new Date().toISOString(),
      sender: {
        id: 2,
        nickname: '김철수',
        profile: 'https://image/url',
      },
    },
  })
  messageInfo: MessageInfo;
}
