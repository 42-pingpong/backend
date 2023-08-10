import { Socket } from 'socket.io';

export interface PlayerInfo {
  socket: Socket;
  id: number;
  token: string;
  roomId?: string;
  number?: number;
}
