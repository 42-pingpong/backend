import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User Id(intra)',
    example: 1,
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'User Name',
    example: 'myukang',
    required: true,
  })
  nickName: string;

  @ApiProperty({
    description: 'User Profile Image',
    example: 'https://cdn.intra.42.fr/users/myukang.jpg',
    required: true,
  })
  profile: string;

  @ApiProperty({
    description: 'User Self Introduction',
    example: 'Hello, I am myukang',
    required: true,
  })
  selfIntroduction: string;

  @ApiProperty({
    description: 'User Level',
    example: 1.0,
    required: true,
  })
  level: number;
}
