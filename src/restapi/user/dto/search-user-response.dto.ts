import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

class SearchUser extends PartialType(
  OmitType(CreateUserDto, ['statusSocketId', 'gameSocketId', 'chatSocketId']),
) {}

export class SearchUserResponseDto {
  foundUsers: SearchUser[];
}
