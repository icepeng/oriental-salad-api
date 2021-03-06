import { JudgeEntity, UploadEntity } from '../../core';

export class Upload {
  name: string;
  judges: Judge[];
}

export class UploadResult {
  name: string;
  judges: Judge[];
  score: string | null;
  rank: number | null;
}

export interface Judge {
  value: number;
  potential: number;
  description: string;
  cardCode: string;
}

export interface Stat {
  id: string;
  name: string;
  average: number;
}

export function toJudge(judge: JudgeEntity): Judge {
  return {
    value: judge.value,
    potential: judge.potential,
    description: judge.description,
    cardCode: judge.cardCode,
  };
}

export function toJudgeEntity(judge: Judge, uploadId: string): JudgeEntity {
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

export function toUploadResult(
  upload: { judges: JudgeEntity[] } & UploadEntity,
): UploadResult {
  return {
    name: upload.name,
    judges: upload.judges.map(item => this.toJudge(item)),
    score: upload.score,
    rank: upload.rank,
  };
}

export function toUploadEntity(upload: Upload): UploadEntity {
  return {
    id: <any>undefined,
    createTime: <any>undefined,
    name: upload.name,
    score: null,
    rank: null,
  };
}

export function formatStat(stat: Stat) {
  return {
    ...stat,
    average: Math.round(stat.average * 10) / 10,
  };
}
