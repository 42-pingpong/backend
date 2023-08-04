import { ApiProperty } from '@nestjs/swagger';
import { RequestType } from 'src/entities/user/request.entity';
import { User } from 'src/entities/user/user.entity';
import { InvitationStatus } from 'src/enum/invitation.enum';

/**
 * @todo api property
 * */

export class GetUserResponseDto {
  @ApiProperty({
    description: '요청 번호',
    example: 1,
  })
  requestId: number;

  @ApiProperty({
    description: '요청한 사람',
    example: {
      id: 107713,
      nickName: '닉넴',
    },
  })
  requestingUser: Partial<User>;

  @ApiProperty({
    description: '요청 타입',
    enum: RequestType,
    enumName: '요청타입',
  })
  requestType: RequestType;

  @ApiProperty({
    description: '요청의 상태',
    enum: InvitationStatus,
    enumName: '요청 상태',
    example: 'NA',
  })
  isAccepted: InvitationStatus;

  @ApiProperty({
    description: '만들어진 날짜',
    example: Date.now(),
  })
  createdAt: Date;
}
