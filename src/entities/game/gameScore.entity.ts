import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { GameInfo } from './gameInfo.entity';

@Entity()
export class GameScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.gameScores)
  @JoinColumn()
  userId: number;

  @ManyToOne(() => GameInfo, (gameInfo) => gameInfo.gameScores)
  @JoinColumn()
  gameId: number;

  score: number;
}
