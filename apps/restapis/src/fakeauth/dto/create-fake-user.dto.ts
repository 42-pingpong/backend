import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateFakeUserDto {
  @ApiProperty({
    description:
      'Fake로 login할 user의 id. 106987: myukang \n 107112: jinkim2, \n 106982: soo \n 106982:gyumpark',
    enum: [107112, 106987, 106982, 106930],
  })
  @Type(() => Number)
  @IsNumber()
  id: number;
}
