import { User } from '@app/common/entities/user.entity';

export class JoinRoomResponse {
  owner: User;
  admin: User[];
  joinedUser: User[];
}
