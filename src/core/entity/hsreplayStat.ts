import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CardEntity } from './card';

@Entity('hsreplay_stat')
export class HSReplayStatEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column('timestamp') updateTime: string;

  @Column('numeric') popularity: string;

  @Column('numeric') winRate: string;

  @Column('numeric') count: string;

  @Column('int') decks: number;

  @Column() cardCode: string;

  @OneToOne(type => CardEntity, card => card.hsreplayStat)
  @JoinColumn({ name: 'cardCode' })
  card?: CardEntity;
}
