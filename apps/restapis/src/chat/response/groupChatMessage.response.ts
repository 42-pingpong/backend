import { ApiProperty } from '@nestjs/swagger';
import { MessageInfo } from '@app/common/entities/messageInfo.entity';

export class GroupChatMessageResponse {
  @ApiProperty({
    description: '해당 메세지의 아이디',
    example: 1,
  })
  groupChatMessageId: number;

  @ApiProperty({
    description: '메세지를 받을 방의 아이디',
    example: 1,
  })
  receivedGroupChatId: number;

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
