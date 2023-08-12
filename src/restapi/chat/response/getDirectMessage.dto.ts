// [
//   {
//     directMessageId: 4,
//     messageInfo: {
//       createdAt: '2023-08-12T05:42:16.454Z',
//       message: 'message from 2251 to 2250',
//       sender: [Object]
//     },
//     receivedUser: { id: 2250, profile: 'ttt', nickName: 'user2250' }
//   },
//   {
//     directMessageId: 3,
//     messageInfo: {
//       createdAt: '2023-08-12T05:42:16.440Z',
//       message: 'message from 2250 to 2251',
//       sender: [Object]
//     },
//     receivedUser: { id: 2251, profile: 'ttt', nickName: 'user2251' }
//   }
// ]

import { ApiProperty } from '@nestjs/swagger';
import { MessageInfo } from 'src/entities/chat/messageInfo.entity';
import { User } from 'src/entities/user/user.entity';

export class GetDirectMessageDtoResponse {
  @ApiProperty({
    description: 'message의 ID',
    example: 1,
  })
  directMessageId: number;

  @ApiProperty({
    description: '메시지 정보',
    example: {
      createdAt: new Date().toISOString(),
      message: 'message from 2250 to 2251',
      sender: {
        id: 2250,
        profile: 'ttt',
        nickName: 'user2250',
      },
    },
  })
  messageInfo: MessageInfo;

  @ApiProperty({
    description: '메시지를 받은 유저',
    example: {
      id: 2251,
      profile: 'ttt',
      nickName: 'user2251',
    },
  })
  receivedUser: User;
}
