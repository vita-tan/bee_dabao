import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Apiary } from './apiary.entity';

@Entity('hives')
@Index(['apiaryId', 'hiveNo'], { unique: true })
export class Hive {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', comment: '蜂场ID' })
  apiaryId: number;

  @ManyToOne(() => Apiary)
  @JoinColumn({ name: 'apiary_id' })
  apiary: Apiary;

  @Column({ type: 'varchar', length: 20, comment: '蜂箱编号' })
  hiveNo: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '蜂种',
    nullable: true,
  })
  beeBreed: string;

  @Column({ type: 'date', comment: '引入日期', nullable: true })
  introDate: Date;

  @Column({
    type: 'tinyint',
    comment: '健康状态: 1正常 2异常 3待观察',
    default: 1,
  })
  health: number;

  @Column({
    type: 'tinyint',
    comment: '蜂王状态: 1正常 2失王 3待确认',
    default: 1,
  })
  queenStatus: number;

  @Column({
    type: 'tinyint',
    comment: '是否在停药期: 0否 1是',
    default: 0,
  })
  inWithdraw: number;

  @Column({ type: 'date', comment: '停药期截止日', nullable: true })
  withdrawEnd: Date;

  @Column({ type: 'varchar', length: 500, comment: '备注', nullable: true })
  notes: string;

  @Column({
    type: 'tinyint',
    comment: '状态: 1在用 0停用',
    default: 1,
  })
  status: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
