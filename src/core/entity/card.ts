import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

import { JudgeEntity } from './judge';

@Entity('card')
export class CardEntity {
  @PrimaryColumn() code: string;

  @CreateDateColumn() createTime: Date;

  @Column() name: string;

  @Column() imgLink: string;

  @Column() type: 'Minion' | 'Spell' | 'Weapon' | 'Hero';

  @Column() rarity: 'Free' | 'Common' | 'Rare' | 'Epic' | 'Legendary';

  @Column()
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

  @Column() cost: number;

  @Column('int', { nullable: true })
  attack: number | null;

  @Column('int', { nullable: true })
  health: number | null;

  @Column('int', { nullable: true })
  durability: number | null;

  @OneToMany(type => JudgeEntity, judge => judge.card)
  judges?: JudgeEntity[];
}
