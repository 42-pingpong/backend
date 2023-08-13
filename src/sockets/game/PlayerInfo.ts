import { Socket } from 'socket.io';

export interface PlayerInfo {
  socket: Socket;
  id: number;
  token: string;
  roomId?: number;
  play_number?: number;
  enemy_id?: number;
}
