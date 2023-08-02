import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteAdminDto {
  @ApiProperty({
    description: 'admin을 추가하고자하는 유저 아이디(삭제요청을 보내는 사람)',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '삭제될 admin의 유저 아이디',
    example: 2,
  })
  @Type(() => Number)
  @IsNumber()
  requestedId: number;
}
