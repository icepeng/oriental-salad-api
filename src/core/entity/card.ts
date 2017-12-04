import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('card')
export class CardEntity {
  @PrimaryGeneratedColumn() id: number;

  @CreateDateColumn() createTime: Date;

  @Column() name: string;
}
