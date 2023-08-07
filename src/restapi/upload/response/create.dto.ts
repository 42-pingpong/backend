import { ApiProperty } from '@nestjs/swagger';

export class CreateResponseDto {
  @ApiProperty({
    description: '이미지 url',
    example:
      'http://localhost:3000/images/1627667446279-IMG_20210730_162744.jpg',
  })
  url: string;
}
