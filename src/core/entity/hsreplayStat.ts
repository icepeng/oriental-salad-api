import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { CardEntity } from './card';

@Entity('hsreplay_stat')
export class HSReplayStatEntity {
  @Column('timestamp') updateTime: string;

  @Column('numeric') popularityAll: string;

  @Column('numeric', { nullable: true })
  popularityClass: string | null;

  @Column('numeric') winRate: string;

  @Column('numeric') count: string;

  @Column('int') decks: number;

  @PrimaryColumn('text') cardCode: string;

  @OneToOne(type => CardEntity, card => card.hsreplayStat)
  @JoinColumn({ name: 'cardCode' })
  card?: CardEntity;
}
