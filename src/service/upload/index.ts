import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { JudgeEntity, UploadEntity } from '../../core';
import { NotFoundError } from '../error';
import { toJudgeEntity, toUploadEntity, toUploadResult, Upload } from './dto';

@Service()
export class UploadService {
  public async getAll(entityManager: EntityManager) {
    return entityManager
      .getRepository(UploadEntity)
      .createQueryBuilder('upload')
      .addSelect('count(judge.id) as judge_count')
      .leftJoin('upload.judges', 'judge')
      .groupBy('upload.id')
      .getRawMany()
      .then(res =>
        res.map(x => ({
          id: x.upload_id,
          name: x.upload_name,
          score: x.upload_score,
          rank: x.upload_rank,
          judgeCount: x.judge_count,
        })),
      );
  }

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
    return toUploadResult(upload);
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
    const bestUploads = await entityManager
      .getRepository(UploadEntity)
      .createQueryBuilder('upload')
      .where('upload.rank is not null')
      .orderBy('upload.rank', 'ASC')
      .take(3)
      .getMany();
    const worstUploads = await entityManager
      .getRepository(UploadEntity)
      .createQueryBuilder('upload')
      .where('upload.rank is not null')
      .orderBy('upload.rank', 'DESC')
      .take(3)
      .getMany();
    return {
      bestUploads,
      worstUploads,
    };
  }
}
