import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateFakeUserDto {
  @ApiProperty({
    description: 'Fake로 login할 user의 id',
    example: '1023',
  })
  @Type(() => Number)
  @IsNumber()
  id: number;
}
