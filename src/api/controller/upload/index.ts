import { Inject, Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { UploadService } from '../../../service';
import { NotFoundError } from '../../../service/error';
import { Request, Response } from '../../yoshi';
import { idValidator, nameValidator, uploadValidator } from './validator';

@Service()
export class UploadController {
  @Inject() uploadService: UploadService;

  getOne = async ({ params }: Request, res: Response, tx: EntityManager) => {
    const { error, value: uploadId } = idValidator(params.id);
    if (error) {
      return res.badRequest({
        message: error.message,
      });
    }

    try {
      const item = await this.uploadService.getOne(tx, uploadId);

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

  findByName = async ({ body }: Request, res: Response, tx: EntityManager) => {
    const { error, value } = nameValidator(body);
    if (error) {
      return res.badRequest({
        message: error.message,
      });
    }

    try {
      const item = await this.uploadService.findByName(tx, value.name);

      return res.ok({
        uploads: item,
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

  findMeaningless = async ({  }: Request, res: Response, tx: EntityManager) => {
    const item = await this.uploadService.findMeaningless(tx, 5);
    return res.ok({
      upload: item,
    });
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
}
