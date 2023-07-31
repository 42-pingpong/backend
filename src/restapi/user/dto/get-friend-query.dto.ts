import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsOptional,
  ValidationError,
} from 'class-validator';

export class GetFriendQueryDto {
  @ApiProperty({
    description: '친구의 상태',
    example: 'online',
    enum: ['offline', 'online', 'inGame', 'all'],
  })
  @IsEnum(['offline', 'online', 'inGame', 'all'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: '자신의 데이터 포함 여부',
    example: 'true',
    type: 'string',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    else if (value === 'false') return false;
    else throw new ValidationError();
    return value;
  })
  includeMe?: boolean;
}
