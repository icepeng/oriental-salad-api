import { CardEntity } from '../../core';

export type Classes =
  | 'Mage'
  | 'Warlock'
  | 'Shaman'
  | 'Paladin'
  | 'Preist'
  | 'Rogue'
  | 'Druid'
  | 'Hunter'
  | 'Warrior';
export type Rarity = 'Free' | 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface CardBase {
  id?: number;
  code: string;
  name: string;
  imgLink: string;
  type: 'Minion' | 'Spell' | 'Weapon' | 'Hero';
  rarity: Rarity;
  cost: number;
}

export interface Hero extends CardBase {
  type: 'Hero';
  class: Classes;
}

export interface Weapon extends CardBase {
  type: 'Weapon';
  attack: number;
  durability: number;
  class: Classes;
}

export interface Spell extends CardBase {
  type: 'Spell';
  class: Classes;
}

export interface Minion extends CardBase {
  type: 'Minion';
  attack: number;
  health: number;
  class: Classes | 'Neutral';
}

export type Card = Minion | Spell | Weapon | Hero;

export interface CardStat {
  20: number;
  30: number;
  40: number;
  50: number;
  60: number;
  70: number;
  80: number;
  mean: number;
  stdev: number;
}

export function toMinion(card: CardEntity): Minion {
  if (card.health === null || card.attack === null) {
    throw new Error('Not Minion');
  }
  return {
    type: 'Minion',
    code: card.code,
    name: card.name,
    imgLink: card.imgLink,
    rarity: card.rarity,
    cost: card.cost,
    attack: card.attack,
    health: card.health,
    class: card.class,
  };
}

export function toSpell(card: CardEntity): Spell {
  if (card.class === 'Neutral') {
    throw new Error('Not Spell');
  }
  return {
    type: 'Spell',
    code: card.code,
    name: card.name,
    imgLink: card.imgLink,
    rarity: card.rarity,
    cost: card.cost,
    class: card.class,
  };
}

export function toWeapon(card: CardEntity): Weapon {
  if (
    card.durability === null ||
    card.attack === null ||
    card.class === 'Neutral'
  ) {
    throw new Error('Not Weapon');
  }
  return {
    type: 'Weapon',
    code: card.code,
    name: card.name,
    imgLink: card.imgLink,
    rarity: card.rarity,
    cost: card.cost,
    attack: card.attack,
    durability: card.durability,
    class: card.class,
  };
}

export function toHero(card: CardEntity): Hero {
  if (card.class === 'Neutral') {
    throw new Error('Not Hero');
  }
  return {
    type: 'Hero',
    code: card.code,
    name: card.name,
    imgLink: card.imgLink,
    rarity: card.rarity,
    cost: card.cost,
    class: card.class,
  };
}

export function toCard(card: CardEntity): Card {
  if (card.type === 'Minion') {
    return toMinion(card);
  }
  if (card.type === 'Spell') {
    return toSpell(card);
  }
  if (card.type === 'Weapon') {
    return toWeapon(card);
  }
  if (card.type === 'Hero') {
    return toHero(card);
  }
  throw new Error('What?');
}

export function MinionToEntity(card: Minion): CardEntity {
  return {
    createTime: <any>undefined,
    type: 'Minion',
    code: card.code,
    name: card.name,
    imgLink: card.imgLink,
    rarity: card.rarity,
    cost: card.cost,
    attack: card.attack,
    health: card.health,
    durability: null,
    class: card.class,
  };
}

export function SpellToEntity(card: Spell): CardEntity {
  return {
    createTime: <any>undefined,
    type: 'Spell',
    code: card.code,
    name: card.name,
    imgLink: card.imgLink,
    rarity: card.rarity,
    cost: card.cost,
    attack: null,
    health: null,
    durability: null,
    class: card.class,
  };
}

export function WeaponToEntity(card: Weapon): CardEntity {
  return {
    createTime: <any>undefined,
    type: 'Weapon',
    code: card.code,
    name: card.name,
    imgLink: card.imgLink,
    rarity: card.rarity,
    cost: card.cost,
    attack: card.attack,
    health: null,
    durability: card.durability,
    class: card.class,
  };
}

export function HeroToEntity(card: Hero): CardEntity {
  return {
    createTime: <any>undefined,
    type: 'Hero',
    code: card.code,
    name: card.name,
    imgLink: card.imgLink,
    rarity: card.rarity,
    cost: card.cost,
    attack: null,
    health: null,
    durability: null,
    class: card.class,
  };
}

export function toCardEntity(card: Card): CardEntity {
  if (card.type === 'Minion') {
    return MinionToEntity(card);
  }
  if (card.type === 'Spell') {
    return SpellToEntity(card);
  }
  if (card.type === 'Weapon') {
    return WeaponToEntity(card);
  }
  if (card.type === 'Hero') {
    return HeroToEntity(card);
  }
  throw new Error('What?');
}
