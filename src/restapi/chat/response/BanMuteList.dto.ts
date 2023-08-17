import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user/user.entity';

export class BanMuteList {
  @ApiProperty({
    description: '그룹 채팅방의 id',
    example: 1,
  })
  groupChatId: number;

  @ApiProperty({
    description: '그룹 채팅방의 이름',
    example: '그룹 채팅방',
  })
  chatName: string;

  @ApiProperty({
    description: '그룹 채팅방의 공개 여부',
    example: 'Pub',
  })
  levelOfPublicity: string;

  @ApiProperty({
    description: '그룹 채팅방 최대 참여 인원',
    example: 10,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '그룹 채팅방 현재 참여 인원',
    example: 1,
  })
  curParticipants: number;

  @ApiProperty({
    description: '그룹 채팅방의 방장Id',
    example: 1,
  })
  ownerId: number;

  @ApiProperty({
    description: '그룹 채팅방 ban된 유저 리스트',
    example: [
      {
        id: 1,
        nickname: 'nickname',
        profile: 'profile',
      },
    ],
    isArray: true,
  })
  bannedUsers: User[];

  @ApiProperty({
    description: '그룹 채팅방 mute된 유저 리스트',
    example: [
      {
        mutedUser: { id: 1, nickname: 'nickname', profile: 'profile' },
        muteDue: '2021-08-01T00:00:00.000Z',
      },
    ],
    isArray: true,
  })
  mutedUsers: User[];
}
