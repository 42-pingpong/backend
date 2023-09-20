import { Socket } from 'socket.io';

export interface PlayerInfo {
  socket: Socket;
  id: number;
  token: string;
  is_host?: boolean;
  roomId?: number;
  play_number?: number;
  enemy_id?: number;
  ready_status?: boolean;
  // go-pingpong 의 경우엔 이걸 나눌 수 없기땜시룽 ...
  gameMode?: string;
}
