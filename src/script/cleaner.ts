import { createConnection } from 'typeorm';

import * as Config from '../config';
import { JudgeEntity, UploadEntity } from '../core';

async function run() {
  const connection = await createConnection(Config.pgConfig);
  try {
    const duplicates = <UploadEntity[]>await connection.query(
      'select * from upload where (name, score) IN(select name, score from upload group by name, score having count(*) > 1) order by "createTime" desc;',
    );
    const toRemove = duplicates.reduce(
      (prev, curr, index, arr) =>
        index > 0 && arr[index - 1].name === curr.name ? [...prev, curr] : prev,
      [],
    );
    await connection.transaction(async tx => {
      await tx
        .createQueryBuilder()
        .delete()
        .from(JudgeEntity)
        .where('uploadId IN (:uploadIds)', {
          uploadIds: toRemove.map(x => x.id),
        })
        .execute();
      await tx.getRepository(UploadEntity).remove(toRemove);
    });
  } catch (err) {
    console.log(err);
  } finally {
    await connection.close();
  }
}

run();
