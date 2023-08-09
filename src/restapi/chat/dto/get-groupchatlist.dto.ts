import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entities/user/user.entity';

export class GetGroupChatListDto {
  @ApiProperty({
    description: '그룹 채팅방 아이디',
    example: 1,
  })
  groupChatId: number;

  @ApiProperty({
    description: '그룹 채팅방 이름',
    example: '그룹 채팅방 이름',
  })
  chatName: string;

  @ApiProperty({
    description: '그룹 채팅방 공개 여부',
    example: 'Pub',
    enum: ['Pub', 'Priv'],
  })
  levelOfPublicity: string;

  @ApiProperty({
    description: '그룹 채팅방 현재 참여 인원',
    example: 1,
  })
  curParticipants: number;

  @ApiProperty({
    description: '그룹 채팅방 최대 참여 인원',
    example: 10,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '그룹 채팅방 생성자',
    example: {
      userId: 1,
      nickname: 'nickname',
      profile: 'profileImage',
    },
  })
  owner: User;

  @ApiProperty({
    description: '그룹 채팅방 참여자',
    example: [
      {
        userId: 2,
        nickname: 'nickname',
        profile: 'profileImage',
      },
    ],
  })
  joinedUser: User[];

  @ApiProperty({
    description: '그룹 채팅방 관리자',
    example: [
      {
        userId: 3,
        nickname: 'nickname',
        profile: 'profileImage',
      },
    ],
  })
  admin: User[];
}
