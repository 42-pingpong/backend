import { Socket } from 'socket.io';

export interface PlayerInfo {
  socket: Socket;
  id: number;
  token: string;
  is_host?: boolean;
  roomId?: number;
  play_number?: number;
  enemy_id?: number;
}
