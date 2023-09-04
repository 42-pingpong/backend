import { CreateRequestFriendDto } from './create-request-friend.dto';

export class UserJobData {
  userId: number;
  clientId: string;
  bearerToken: string;
}

export class RequestFriendDto extends UserJobData {
  friendRequestBody: CreateRequestFriendDto;
}
