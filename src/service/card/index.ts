import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { calculateStats } from '../../util/stat';

import { CardEntity, CardStatEntity, JudgeEntity } from '../../core';
import { NotFoundError } from '../error';
import { CARD_LIST } from './cards';
import { Card, toCard, toCardEntity } from './dto';

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
        ? (
            card.judges.reduce((sum, x) => sum + x.description.length, 0) /
            judgeTotal
          ).toString()
        : '0';
    return {
      value,
      potential,
      judgeTotal,
      descriptionAverage,
      cardCode: card.code,
    };
  }

  private async saveStats(entityManager: EntityManager) {
    const cards = <({
      judges: JudgeEntity[];
    } & CardEntity)[]>await entityManager
      .getRepository(CardEntity)
      .find({ relations: ['judges'] });

    const stats = cards.map(card => this.buildCardStat(card));

    await entityManager.getRepository(CardStatEntity).save(stats);

    return stats;
  }

  public async getStatTotal(entityManager: EntityManager) {
    const cardsWithStat = await entityManager
      .getRepository(CardEntity)
      .find({ relations: ['hsreplayStat', 'stat'] });

    try {
      return cardsWithStat.map(card => {
        if (!card.stat) {
          throw new NotFoundError();
        }
        if (!card.hsreplayStat) {
          return card.stat;
        }
        return {
          ...card.stat,
          hsreplay: {
            winRate: card.hsreplayStat.winRate,
            popularity: card.hsreplayStat.popularityAll,
            popularityClass: card.hsreplayStat.popularityClass,
            value: card.hsreplayStat.value,
            potential: card.hsreplayStat.potential,
            archetypes:
              typeof card.hsreplayStat.archetypes === 'string'
                ? JSON.parse(<any>card.hsreplayStat.archetypes)
                : card.hsreplayStat.archetypes,
            // TODO: remove JSON.parse when typeorm bug fixed
          },
        };
      });
    } catch (err) {
      await this.saveStats(entityManager);
      throw err;
    }
  }

  public async getStatDetail(entityManager: EntityManager, cardCode: string) {
    const judgeRepo = entityManager.getRepository(JudgeEntity);

    const maxValueJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .andWhere('char_length(judge.description) > 0')
      .orderBy('judge.value', 'DESC')
      .addOrderBy('random()')
      .limit(1)
      .getOne();

    const minValueJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .andWhere('char_length(judge.description) > 0')
      .orderBy('judge.value', 'ASC')
      .addOrderBy('random()')
      .limit(1)
      .getOne();

    const maxPotentialJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .andWhere('char_length(judge.description) > 0')
      .orderBy('judge.potential', 'DESC')
      .addOrderBy('random()')
      .limit(1)
      .getOne();

    const minPotentialJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .andWhere('char_length(judge.description) > 0')
      .orderBy('judge.potential', 'ASC')
      .addOrderBy('random()')
      .limit(1)
      .getOne();

    const longestJudge = await judgeRepo
      .createQueryBuilder('judge')
      .leftJoinAndSelect('judge.upload', 'upload')
      .where('judge.cardCode = :cardCode', { cardCode })
      .orderBy('char_length(judge.description)', 'DESC')
      .limit(1)
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
