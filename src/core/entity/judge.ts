import { UploadEntity } from '@core';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('judge')
export class JudgeEntity {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn() createTime: Date;

  @ManyToOne(type => UploadEntity, upload => upload.judges)
  @JoinColumn()
  upload?: UploadEntity;
}
