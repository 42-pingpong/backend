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
  })
  nickName: string;

  @ApiProperty({
    description: 'User Email',
    example: 'myunghwan0421@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'User Full Name',
    example: 'MyungHwan Kang',
  })
  fullName: string;

  @ApiProperty({
    description: 'User Profile Image',
    example: 'https://cdn.intra.42.fr/users/myukang.jpg',
  })
  profile: string;

  @ApiProperty({
    description: 'User Self Introduction',
    example: 'Hello, I am myukang',
  })
  selfIntroduction: string;

  @ApiProperty({
    description: 'User Level',
    example: 1.0,
  })
  level: number;

  @ApiProperty({
    description: 'User Status',
    example: 'online',
  })
  status: string;

  @ApiProperty({
    description: 'User Socket Id',
    example: '1234',
  })
  socketId: string;
}
