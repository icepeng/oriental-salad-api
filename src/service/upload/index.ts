import { UploadEntity } from '@core';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { NotFoundError } from '../error';
import { Upload } from './dto';

@Service()
export class UploadService {
  public async getAll(entityManager: EntityManager): Promise<Upload[]> {
    return entityManager.getRepository(UploadEntity).find();
  }

  public async getOne(
    entityManager: EntityManager,
    id: number,
  ): Promise<Upload> {
    const upload = await entityManager
      .getRepository(UploadEntity)
      .findOne({ id });
    if (!upload) {
      throw new NotFoundError();
    }
    return upload;
  }

  public async create(
    entityManager: EntityManager,
    upload: Upload,
  ): Promise<number> {
    const createdEntity = await entityManager
      .getRepository(UploadEntity)
      .save(upload);

    return createdEntity.id;
  }
}
