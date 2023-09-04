import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

class CreateUserDto {
  @ApiProperty({
    description: 'User Id(intra)',
    example: 1,
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
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
    description: 'User Status Socket Id',
    example: '1234',
  })
  statusSocketId: string;

  @ApiProperty({
    description: 'User Game Socket Id',
    example: '1234',
  })
  gameSocketId: string;

  @ApiProperty({
    description: 'User Chat Socket Id',
    example: '1234',
  })
  chatSocketId: string;
}

export class UserFactory {
  createUser(id: number): CreateUserDto {
    // You can implement the logic to fetch a user from a database or any other data source
    // For this example, we'll return a hardcoded user based on the provided id.
    const user: CreateUserDto = {
      id,
      nickName: 'user' + id,
      level: 5.5,
      profile: 'ttt',
      fullName: 'fullName',
      email: 'loginEmail' + id,
      selfIntroduction: 'NONE',
      status: 'online',
      statusSocketId: null,
      gameSocketId: null,
      chatSocketId: null,
    };
    return user;
  }
}
