import { CardService, UploadService } from '@service';
import { NotFoundError } from '@service/error';
import { Inject, Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { Request, Response } from '../../yoshi';
import { uploadValidator } from './validator';

@Service()
export class UploadController {
  @Inject() uploadService: UploadService;
  @Inject() cardService: CardService;

  getOne = async ({ params }: Request, res: Response, tx: EntityManager) => {
    try {
      const item = await this.uploadService.getOne(tx, +params.id);

      return res.ok({
        upload: item,
      });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return res.notFound({
          message: 'No upload found with the given id.',
        });
      }
      throw err;
    }
  };

  add = async ({ body }: Request, res: Response, tx: EntityManager) => {
    const { error, value } = uploadValidator(body);
    if (error) {
      return res.badRequest({
        message: error.message,
      });
    }

    const id = await this.uploadService.create(tx, value);
    return res.ok({ id });
  };

  init = async ({  }: Request, res: Response, tx: EntityManager) => {
    await this.cardService.init(tx);
    return res.ok();
  };
}
