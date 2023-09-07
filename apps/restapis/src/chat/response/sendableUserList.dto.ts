import { User } from '@app/common';

export class SendableGroupchatUserList {
  owner: Partial<User>;
  admin: Partial<User>[];
  joinedUser: Partial<User>[];
}
