import { CardEntity } from '@core';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { NotFoundError } from '../error';
import { Card, toCard, toCardEntity } from './dto';

@Service()
export class CardService {
  public async getAll(entityManager: EntityManager): Promise<Card[]> {
    const cards = await entityManager.getRepository(CardEntity).find();
    return cards.map(card => toCard(card));
  }

  public async getOne(entityManager: EntityManager, id: number): Promise<Card> {
    const card = await entityManager.getRepository(CardEntity).findOne({ id });
    if (!card) {
      throw new NotFoundError();
    }
    return toCard(card);
  }

  public async create(
    entityManager: EntityManager,
    card: Card,
    organizationId: number,
  ): Promise<number> {
    const cardEntity = toCardEntity(card);
    const createdEntity = await entityManager
      .getRepository(CardEntity)
      .save(cardEntity);

    return createdEntity.id;
  }
}
