import { ApiProperty } from '@nestjs/swagger';

export class AddAdminDto {
  @ApiProperty({
    description: 'admin을 추가하고자하는 유저 아이디',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'admin으로 추가될 유저 아이디',
    example: 2,
  })
  requestedId: number;
}
