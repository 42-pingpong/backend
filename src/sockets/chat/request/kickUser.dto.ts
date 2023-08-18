export class KickUserDto {
  groupChatId: number;

  // should be In Group
  kickUserId: number;

  // should be Owner/Admin
  requestUserId: number;
}
