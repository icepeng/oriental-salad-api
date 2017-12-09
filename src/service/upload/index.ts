import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { JudgeEntity, UploadEntity } from '../../core';
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

  public async findByName(entityManager: EntityManager, name: string) {
    const uploads = <({
      judges: JudgeEntity[];
    } & UploadEntity)[]>await entityManager.getRepository(UploadEntity).find({
      where: { name },
      relations: ['judges'],
    });

    return uploads.map(upload => ({
      id: upload.id,
      name: upload.name,
      judgeCount: upload.judges.length,
    }));
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

  public async getStats(entityManager: EntityManager) {
    // const uploads = entityManager
    //   .getRepository(UploadEntity)
    //   .createQueryBuilder('upload')
    //   .leftJoinAndSelect('upload.judges', 'judge')
    //   .getMany();
  }
}
