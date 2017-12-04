import { CardEntity } from '@core';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { NotFoundError } from '../error';
import { Card } from './dto';

@Service()
export class CardService {
  public async getAll(entityManager: EntityManager): Promise<Card[]> {
    return entityManager.getRepository(CardEntity).find();
  }

  public async getOne(entityManager: EntityManager, id: number): Promise<Card> {
    const card = await entityManager.getRepository(CardEntity).findOne({ id });
    if (!card) {
      throw new NotFoundError();
    }
    return card;
  }

  public async create(
    entityManager: EntityManager,
    card: Card,
    organizationId: number,
  ): Promise<number> {
    const createdEntity = await entityManager
      .getRepository(CardEntity)
      .save(card);

    return createdEntity.id;
  }
}
