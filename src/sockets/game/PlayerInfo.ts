import { Socket } from 'socket.io';

export interface PlayerInfo {
  socket: Socket;
  id: number;
  token: string;
  roomId?: number;
  number?: number;
}
