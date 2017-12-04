import { JudgeEntity } from '@core';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('upload')
export class UploadEntity {
  @PrimaryGeneratedColumn('uuid') id: string;

  @CreateDateColumn() createTime: Date;

  @Column('text') name: string;

  @OneToMany(type => JudgeEntity, judge => judge.upload)
  judges?: JudgeEntity[];
}
