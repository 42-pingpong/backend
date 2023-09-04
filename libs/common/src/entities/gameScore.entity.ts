import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { GameInfo } from './gameInfo.entity';

@Entity()
@Index(['userId'])
export class GameScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    default: 0,
  })
  score: number;

  @ManyToOne(() => User, (user) => user.gameScores)
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column({
    type: 'int',
  })
  userId: number;

  @ManyToOne(() => GameInfo, (gameInfo) => gameInfo.gameScores)
  @JoinColumn({ name: 'gameId' })
  game: GameInfo;
  @Column({
    type: 'int',
  })
  gameId: number;
}
