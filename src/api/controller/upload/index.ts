import { Inject, Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { UploadService } from '../../../service';
import { NotFoundError } from '../../../service/error';
import { Request, Response } from '../../yoshi';
import { idValidator, uploadValidator } from './validator';

@Service()
export class UploadController {
  @Inject() uploadService: UploadService;

  getAll = async ({ params }: Request, res: Response, tx: EntityManager) => {
    try {
      const item = await this.uploadService.getAll(tx);

      return res.ok({
        uploads: item,
      });
    } catch (err) {
      throw err;
    }
  };

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

  add = async ({ body }: Request, res: Response, tx: EntityManager) => {
    const now = new Date().getTime();
    const nextRelease = 1512691200000;
    if (now > nextRelease) {
      return res.badRequest({
        message: '확장팩이 발매되어 더이상 평가할 수 없습니다.',
      });
    }

    const { error, value } = uploadValidator(body);
    if (error) {
      return res.badRequest({
        message: error.message,
      });
    }

    const id = await this.uploadService.create(tx, value);
    return res.ok({ id });
  };

  getStats = async ({  }: Request, res: Response, tx: EntityManager) => {
    const stats = await this.uploadService.getStats(tx);
    return res.ok({ stats });
  };
}
