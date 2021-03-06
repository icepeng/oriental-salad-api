import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CardEntity } from './card';

@Entity('card_stat')
export class CardStatEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column('json')
  value: {
    20: number;
    30: number;
    40: number;
    50: number;
    60: number;
    70: number;
    80: number;
    mean: number;
    stdev: number;
  };

  @Column('json')
  potential: {
    20: number;
    30: number;
    40: number;
    50: number;
    60: number;
    70: number;
    80: number;
    mean: number;
    stdev: number;
  };

  @Column('int') judgeTotal: number;

  @Column('numeric') descriptionAverage: string;

  @Column('text') cardCode: string;

  @OneToOne(type => CardEntity, card => card.stat)
  @JoinColumn({ name: 'cardCode' })
  card?: CardEntity;
}
