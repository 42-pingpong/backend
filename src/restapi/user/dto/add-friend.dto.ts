import { ApiProperty } from '@nestjs/swagger';

export class AddFriendDto {
  @ApiProperty({
    description: '친구 추가할 유저의 id',
    example: 1,
  })
  friendId: number;
}
