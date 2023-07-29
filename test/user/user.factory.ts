import { CreateUserDto } from 'src/restapi/user/dto/create-user.dto';

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
      selfIntroduction: '00',
      status: 'online',
      statusSocketId: null,
      gameSocketId: null,
      chatSocketId: null,
    };
    return user;
  }
}
