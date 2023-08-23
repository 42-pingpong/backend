import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Request, RequestType } from '@app/common/entities/request.entity';
import { User } from '@app/common/entities/user.entity';
import { InvitationStatus } from '@app/common/enum/invitation.enum';

/**
 * @todo api property
 * */

export class GetAlarmResponseDto extends PartialType(Request) {
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
  requestingUser: User;

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
    example: `${new Date().toISOString()}`,
  })
  createdAt: Date;

  @ApiProperty({
    description: '지난 시간',
    example: '1시간 전',
  })
  pastTime?: string;
}
