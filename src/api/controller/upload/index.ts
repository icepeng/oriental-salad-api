import { UploadService } from '@service';
import { NotFoundError } from '@service/error';
import { Inject, Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { Request, Response } from '../../yoshi';
import { accountValidator } from './validator';

@Service()
export class UploadController {
  @Inject() uploadService: UploadService;

  getOne = async (
    { params, user }: Request,
    res: Response,
    tx: EntityManager,
  ) => {
    try {
      const item = await this.uploadService.getOne(tx, +params.id);

      return res.ok({
        account: item,
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

  add = async ({ body, user }: Request, res: Response, tx: EntityManager) => {
    const { error } = accountValidator(body);
    if (error) {
      return res.badRequest({
        message: error.message,
      });
    }

    await this.uploadService.create(tx, body);
    return res.ok();
  };
}
