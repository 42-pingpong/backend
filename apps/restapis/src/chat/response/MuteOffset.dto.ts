import { ApiProperty } from '@nestjs/swagger';

export class MuteOffsetDto {
  @ApiProperty({
    description: '남은 mute 시간 / millisecond',
    example: 500,
  })
  muteFor: number;

  @ApiProperty({
    description: '그룹 채팅방 id',
    example: 1,
  })
  groupChatId: number;
}
