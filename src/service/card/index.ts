import { CardEntity } from '@core';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { NotFoundError } from '../error';
import { CARD_LIST } from './cards';
import { Card, toCard, toCardEntity } from './dto';

@Service()
export class CardService {
  public async getAll(entityManager: EntityManager): Promise<Card[]> {
    const cards = await entityManager.getRepository(CardEntity).find();
    return cards.map(card => toCard(card));
  }

  public async getOne(entityManager: EntityManager, code: string): Promise<Card> {
    const card = await entityManager.getRepository(CardEntity).findOne({ code });
    if (!card) {
      throw new NotFoundError();
    }
    return toCard(card);
  }

  public async create(
    entityManager: EntityManager,
    card: Card,
  ): Promise<string> {
    const cardEntity = toCardEntity(card);
    const createdEntity = await entityManager
      .getRepository(CardEntity)
      .save(cardEntity);

    return createdEntity.code;
  }

  public async init(entityManager: EntityManager) {
    const cards = CARD_LIST.map(item => toCardEntity(item));
    return entityManager
      .getRepository(CardEntity)
      .save(cards);
  }
}
