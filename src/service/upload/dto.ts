import { JudgeEntity, UploadEntity } from '@core';
export class Upload {
  name: string;
  judges: Judge[];
}

export interface Judge {
  value: number;
  potential: number;
  description: string;
  cardCode: string;
}

export function toJudge(judge: JudgeEntity): Judge {
  return {
    value: judge.value,
    potential: judge.potential,
    description: judge.description,
    cardCode: judge.cardCode,
  };
}

export function toJudgeEntity(judge: Judge, uploadId: number): JudgeEntity {
  return {
    uploadId,
    id: <any>undefined,
    createTime: <any>undefined,
    value: judge.value,
    potential: judge.potential,
    description: judge.description,
    cardCode: judge.cardCode,
  };
}

export function toUpload(upload: { judges: JudgeEntity[] } & UploadEntity): Upload {
  return {
    name: upload.name,
    judges: upload.judges.map(item => this.toJudge(item)),
  };
}

export function toUploadEntity(upload: Upload): UploadEntity {
  return {
    id: <any>undefined,
    createTime: <any>undefined,
    name: upload.name,
  };
}
