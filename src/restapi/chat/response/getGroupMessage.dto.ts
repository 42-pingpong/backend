import { ApiProperty } from '@nestjs/swagger';
import { GroupChat } from 'src/entities/chat/groupChat.entity';
import { MessageInfo } from 'src/entities/chat/messageInfo.entity';

export class GetGroupMessageResponse {
  @ApiProperty({
    description: 'message의 ID',
    example: 1,
  })
  groupChatMessageId: number;

  @ApiProperty({
    description: '메시지 정보',
    example: {
      createdAt: new Date().toISOString(),
      message: 'message from ',
      sender: {
        id: 2250,
        profile: 'ttt',
        nickName: 'user2250',
      },
    },
  })
  messageInfo: MessageInfo;

  @ApiProperty({
    description: '메시지를 받은 그룹 채팅방',
    example: {
      groupChatId: 18,
      chatName: 'test',
    },
  })
  receivedGroupChat: GroupChat;
}
