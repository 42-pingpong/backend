import { CreateRequestFriendDto } from 'src/restapi/user/dto/create-request-friend.dto';

export interface UserJobData {
  userId: number;
  clientId: string;
  bearerToken: string;
}

export interface FriendRequestJobData extends UserJobData {
  friendRequestBody: CreateRequestFriendDto;
}
