import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { GameScore } from './gameScore.entity';

@Entity()
export class GameInfo {
  @PrimaryGeneratedColumn()
  gameId: number;

  @CreateDateColumn()
  createDate: Date;

  @Column({
    type: 'varchar',
    length: 100,
  })
  gameMap: string;

  @OneToMany(() => GameScore, (gameScore) => gameScore.gameId)
  gameScores: GameScore[];
}
