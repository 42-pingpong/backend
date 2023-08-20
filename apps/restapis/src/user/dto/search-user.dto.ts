import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchUserDto {
  @ApiProperty({
    description: '닉네임',
    example: 'myu',
    required: false,
  })
  @IsString()
  @IsOptional()
  nickName?: string;

  @ApiProperty({
    description: '이메일',
    example: 'my',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;
}
