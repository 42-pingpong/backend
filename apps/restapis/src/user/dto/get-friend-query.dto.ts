import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetFriendQueryDto {
  @ApiProperty({
    description: '친구의 상태',
    example: 'online',
    enum: ['offline', 'online', 'inGame', 'all'],
  })
  @IsEnum(['offline', 'online', 'inGame', 'all'])
  @IsOptional()
  status?: string;
}
