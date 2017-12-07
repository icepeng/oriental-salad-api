import { Service } from 'typedi';
import { EntityManager } from 'typeorm';

import { JudgeEntity, UploadEntity } from '../../core';
import { NotFoundError } from '../error';
import {
  formatStat,
  Stat,
  toJudgeEntity,
  toUpload,
  toUploadEntity,
  Upload,
} from './dto';

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
    const judgeCount = await entityManager.getRepository(JudgeEntity).count();
    const uploadCount = await entityManager.getRepository(UploadEntity).count();
    const highestValues = <Stat[]>await entityManager.query(
      `SELECT x.id, x.name, x.average
    FROM (SELECT upload.id, upload.name, avg(judge.value) AS average, count(judge.id) AS Count
          FROM upload LEFT OUTER JOIN judge ON judge."uploadId" = upload.id GROUP BY upload.id) AS x
    WHERE Count > 100 order by average DESC LIMIT 3;`,
    );
    const lowestValues = <Stat[]>await entityManager.query(
      `SELECT x.id, x.name, x.average
    FROM (SELECT upload.id, upload.name, avg(judge.value) AS average, count(judge.id) AS Count
          FROM upload LEFT OUTER JOIN judge ON judge."uploadId" = upload.id GROUP BY upload.id) AS x
    WHERE Count > 100 order by average ASC LIMIT 3;`,
    );
    const highestPotentials = <Stat[]>await entityManager.query(
      `SELECT x.id, x.name, x.average
    FROM (SELECT upload.id, upload.name, avg(judge.potential) AS average, count(judge.id) AS Count
          FROM upload LEFT OUTER JOIN judge ON judge."uploadId" = upload.id GROUP BY upload.id) AS x
    WHERE Count > 100 order by average DESC LIMIT 3;`,
    );
    const lowestPotentials = <Stat[]>await entityManager.query(
      `SELECT x.id, x.name, x.average
    FROM (SELECT upload.id, upload.name, avg(judge.potential) AS average, count(judge.id) AS Count
          FROM upload LEFT OUTER JOIN judge ON judge."uploadId" = upload.id GROUP BY upload.id) AS x
    WHERE Count > 100 order by average ASC LIMIT 3;`,
    );
    const longestDescriptions = await entityManager.query(`
      SELECT upload.id, upload.name, sum(char_length(judge.description)) AS length
       FROM upload
       LEFT OUTER JOIN judge ON judge."uploadId" = upload.id
       GROUP BY upload.id ORDER BY length DESC LIMIT 3;`);
    return {
      judgeCount,
      uploadCount,
      longestDescriptions,
      highestValues: highestValues.map(x => formatStat(x)),
      lowestValues: lowestValues.map(x => formatStat(x)),
      highestPotentials: highestPotentials.map(x => formatStat(x)),
      lowestPotentials: lowestPotentials.map(x => formatStat(x)),
    };
  }
}
