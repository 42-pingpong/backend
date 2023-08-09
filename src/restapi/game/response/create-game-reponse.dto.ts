import { ApiProperty } from '@nestjs/swagger';

export class CreateGameResponseDto {
  @ApiProperty({
    description: '게임방 아이디',
    example: 1,
  })
  gameId: number;

  @ApiProperty({
    description: '게임방 생성 날짜',
    example: new Date().toISOString(),
  })
  createDate: Date;

  @ApiProperty({
    description: '게임방 맵 이미지',
    example: 'default',
  })
  gameMap: string;
}
