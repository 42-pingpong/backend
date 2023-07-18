import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { GameInfo } from './gameInfo.entity';

@Entity()
export class GameScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.gameScores)
  userId: number;

  @ManyToOne(() => GameInfo, (gameInfo) => gameInfo.gameScores)
  gameId: number;

  score: number;
}
