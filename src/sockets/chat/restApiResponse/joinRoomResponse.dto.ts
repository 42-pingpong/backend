import { User } from 'src/entities/user/user.entity';

export class JoinRoomResponse {
  owner: User;
  admin: User[];
  joinedUser: User[];
}
