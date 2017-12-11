import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CardEntity } from './card';
import { UploadEntity } from './upload';

@Entity('judge')
export class JudgeEntity {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn() createTime: Date;

  @Column('int') value: number;

  @Column('int') potential: number;

  @Column('text') description: string;

  @Column() uploadId: string;

  @ManyToOne(type => UploadEntity, upload => upload.judges)
  @JoinColumn({ name: 'uploadId' })
  upload?: UploadEntity;

  @Column() cardCode: string;

  @ManyToOne(type => CardEntity, card => card.judges)
  @JoinColumn({ name: 'cardCode' })
  card?: CardEntity;
}
