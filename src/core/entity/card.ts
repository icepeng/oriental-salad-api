import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { CardStatEntity } from './cardStat';
import { HSReplayStatEntity } from './hsreplayStat';
import { JudgeEntity } from './judge';

@Entity('card')
export class CardEntity {
  @PrimaryColumn('text') code: string;

  @CreateDateColumn() createTime: Date;

  @Column('text') name: string;

  @Column('text') imgLink: string;

  @Column('text') type: 'Minion' | 'Spell' | 'Weapon' | 'Hero';

  @Column('text') rarity: 'Free' | 'Common' | 'Rare' | 'Epic' | 'Legendary';

  @Column('text')
  class:
    | 'Mage'
    | 'Warlock'
    | 'Shaman'
    | 'Paladin'
    | 'Preist'
    | 'Rogue'
    | 'Druid'
    | 'Hunter'
    | 'Warrior'
    | 'Neutral';

  @Column('int') cost: number;

  @Column('int', { nullable: true })
  attack: number | null;

  @Column('int', { nullable: true })
  health: number | null;

  @Column('int', { nullable: true })
  durability: number | null;

  @OneToMany(type => JudgeEntity, judge => judge.card)
  judges?: JudgeEntity[];

  @OneToOne(type => CardStatEntity, stat => stat.card)
  stat?: CardStatEntity;

  @OneToOne(type => HSReplayStatEntity, hsreplayStat => hsreplayStat.card)
  hsreplayStat?: HSReplayStatEntity;
}
