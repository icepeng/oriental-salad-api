import { JudgeEntity, UploadEntity } from '@core';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { NotFoundError } from '../error';
import { toJudgeEntity, toUpload, toUploadEntity, Upload } from './dto';

@Service()
export class UploadService {
  public async getOne(
    entityManager: EntityManager,
    id: string,
  ): Promise<Upload> {
    const upload = <{
      judges: JudgeEntity[];
    } & UploadEntity>await entityManager
      .getRepository(UploadEntity)
      .findOne({ id }, { relations: ['judges'] });
    if (!upload) {
      throw new NotFoundError();
    }
    return toUpload(upload);
  }

  public async create(
    entityManager: EntityManager,
    upload: Upload,
  ): Promise<string> {
    const uploadEntity = toUploadEntity(upload);
    const createdUpload = await entityManager
      .getRepository(UploadEntity)
      .save(uploadEntity);

    const judgeEntities = upload.judges.map(item =>
      toJudgeEntity(item, createdUpload.id),
    );
    await entityManager.getRepository(JudgeEntity).save(judgeEntities);

    return createdUpload.id;
  }
}
