import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entities/user/user.entity';

export class GetFriendResponseDto {
  @ApiProperty({
    description: '유저',
    example: {
      email: 'loginEmail8',
      fullName: 'fullName',
      id: 8,
      level: 5.5,
      nickName: 'user8',
      profile: 'ttt',
      selfIntroduction: '00',
      statusSocketId: null,
      chatSocketId: null,
      gameSocketId: null,
      status: 'online',
    },
  })
  user: User;

  @ApiProperty({
    description: '유저의 id',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '친구',
    example: {
      email: 'loginEmail8',
      fullName: 'fullName',
      id: 8,
      level: 5.5,
      nickName: 'user8',
      profile: 'ttt',
      selfIntroduction: '00',
      socketId: null,
      status: 'online',
    },
  })
  friend: User;

  @ApiProperty({
    description: '친구의 id',
    example: 2,
  })
  friendId: number;
}
