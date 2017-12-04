import { CardEntity, UploadEntity } from '@core';
import {
  Column,
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

  @Column() value: number;

  @Column() potential: number;

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
