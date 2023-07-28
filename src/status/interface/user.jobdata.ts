import { IUser } from 'src/interface/IUser.types';

export interface UserJobData {
  user: IUser;
  clientId: string;
  bearerToken: string;
}
