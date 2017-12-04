import { JudgeEntity } from '@core';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('card')
export class CardEntity {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn() createTime: Date;

  code: string;

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

  @Column() attack: number | null;

  @Column() health: number | null;

  @Column() durability: number | null;

  @OneToMany(type => JudgeEntity, judge => judge.card)
  judges?: JudgeEntity[];
}
