import { ApiProperty } from '@nestjs/swagger';

export class BanDto {
  @ApiProperty({
    description: 'ban을 요청하는 유저 아이디',
    example: 101234,
  })
  userId: number;

  @ApiProperty({
    description: 'ban을 당하는 유저 아이디',
    example: 101235,
  })
  bannedId: number;
}
