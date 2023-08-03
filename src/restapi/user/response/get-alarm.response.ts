import { RequestType } from 'src/entities/user/request.entity';
import { User } from 'src/entities/user/user.entity';
import { InvitationStatus } from 'src/enum/invitation.enum';

/**
 * @todo api property
 * */
export class GetUserResponseDto {
  requestId: number;

  requestingUser: Partial<User>;

  requestType: RequestType;

  isAccepted: InvitationStatus;

  createdAt: Date;
}
