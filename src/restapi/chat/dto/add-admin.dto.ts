import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class AddAdminDto {
  @ApiProperty({
    description: 'admin을 추가하고자하는 유저 아이디',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'admin으로 추가될 유저 아이디',
    example: 2,
  })
  @Type(() => Number)
  @IsNumber()
  requestedId: number;
}
