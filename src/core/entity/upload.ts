import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { JudgeEntity } from './judge';

@Entity('upload')
export class UploadEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @CreateDateColumn() createTime: Date;

  @Column('text') name: string;

  @Column('decimal', { nullable: true })
  score: string | null;

  @Column('int', { nullable: true })
  rank: number | null;

  @OneToMany(type => JudgeEntity, judge => judge.upload)
  judges?: JudgeEntity[];
}
