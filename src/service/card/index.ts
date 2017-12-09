import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { calculateStats } from 'util/stat';

import { CardEntity, CardStatEntity, JudgeEntity } from '../../core';
import { NotFoundError } from '../error';
import { CARD_LIST } from './cards';
import { Card, CardStat, toCard, toCardEntity } from './dto';

@Service()
export class CardService {
  public async getAll(entityManager: EntityManager): Promise<Card[]> {
    const cards = await entityManager.getRepository(CardEntity).find();
    return cards.map(card => toCard(card));
  }

  public async getOne(
    entityManager: EntityManager,
    code: string,
  ): Promise<Card> {
    const card = await entityManager
      .getRepository(CardEntity)
      .findOne({ code });
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
    return entityManager.getRepository(CardEntity).save(cards);
  }

  private buildCardStat(
    card: {
      judges: JudgeEntity[];
    } & CardEntity,
  ) {
    const value = calculateStats(card.judges.map(x => x.value));
    const potential = calculateStats(card.judges.map(x => x.potential));
    const judgeTotal = card.judges.length;
    const descriptionAverage =
      judgeTotal > 0
        ? card.judges.reduce((sum, x) => sum + x.description.length, 0) /
          judgeTotal
        : 0;
    return {
      value,
      potential,
      judgeTotal,
      descriptionAverage,
      cardCode: card.code,
    };
  }

  public async getStatTotal(entityManager: EntityManager) {
    const cachedStats = await entityManager
      .getRepository(CardStatEntity)
      .find();

    if (cachedStats.length > 0) {
      return cachedStats;
    }

    const cards = <({
      judges: JudgeEntity[];
    } & CardEntity)[]>await entityManager
      .getRepository(CardEntity)
      .find({ relations: ['judges'] });

    const stats = cards.map(card => this.buildCardStat(card));

    await entityManager.getRepository(CardStatEntity).save(stats);

    return stats;
  }

  private async fetchStatDetail(
    entityManager: EntityManager,
    cardCode: string,
  ) {
    const cachedStats = await entityManager
      .getRepository(CardStatEntity)
      .findOne({ cardCode });

    if (cachedStats) {
      return cachedStats;
    }

    const card = <{
      judges: JudgeEntity[];
    } & CardEntity>await entityManager.getRepository(CardEntity).findOne({
      where: { code: cardCode },
      relations: ['judges'],
    });

    if (!card) {
      throw new NotFoundError();
    }

    const stats = this.buildCardStat(card);

    await entityManager.getRepository(CardStatEntity).save(stats);

    return stats;
  }

  private getMax(arr: CardStat) {
    let max = 80;
    while (arr[max] === 0) {
      max -= 10;
      if (max < 20) {
        return 0;
      }
    }
    return max;
  }

  private getMin(arr: CardStat) {
    let max = 20;
    while (arr[max] === 0) {
      max -= 10;
      if (max > 80) {
        return 0;
      }
    }
    return max;
  }

  public async getStatDetail(entityManager: EntityManager, cardCode: string) {
    const stats = await this.fetchStatDetail(entityManager, cardCode);

    const maxValue = this.getMax(stats.value);
    const minValue = this.getMin(stats.value);
    const maxPotential = this.getMax(stats.potential);
    const minPotential = this.getMin(stats.potential);

    const judgeRepo = entityManager.getRepository(JudgeEntity);

    const maxValueJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .andWhere('judge.value = :maxValue', { maxValue })
      .andWhere('char_length(judge.description) > 0')
      .orderBy('random()')
      .getOne();

    const minValueJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .andWhere('judge.value = :minValue', { minValue })
      .andWhere('char_length(judge.description) > 0')
      .orderBy('random()')
      .getOne();

    const maxPotentialJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .andWhere('judge.potential = :maxPotential', { maxPotential })
      .andWhere('char_length(judge.description) > 0')
      .orderBy('random()')
      .getOne();

    const minPotentialJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .andWhere('judge.potential = :minPotential', { minPotential })
      .andWhere('char_length(judge.description) > 0')
      .orderBy('random()')
      .getOne();

    const longestJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .orderBy('char_length(judge.description)', 'DESC')
      .getOne();

    return {
      maxValueJudge,
      minValueJudge,
      maxPotentialJudge,
      minPotentialJudge,
      longestJudge,
    };
  }
}
