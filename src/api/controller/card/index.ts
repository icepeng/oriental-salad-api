import { CardService } from '@service';
import { Inject, Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { Request, Response } from '../../yoshi';

@Service()
export class CardController {
  @Inject() cardService: CardService;

  getAll = async ({ params }: Request, res: Response, tx: EntityManager) => {
    try {
      const cards = await this.cardService.getAll(tx);
      return res.ok({
        cards,
      });
    } catch (err) {
      throw err;
    }
  };

  init = async ({  }: Request, res: Response, tx: EntityManager) => {
    await this.cardService.init(tx);
    return res.ok();
  };
}
