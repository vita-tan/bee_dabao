import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('honey_harvests')
export class HoneyHarvest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', comment: '蜂场ID' })
  apiaryId: number;

  @Column({ type: 'bigint', comment: '蜂农ID' })
  beekeeperId: number;

  @Column({ type: 'date', comment: '采蜜日期' })
  harvestDate: Date;

  @Column({ type: 'varchar', length: 50, comment: '蜜种' })
  honeyType: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '产量(kg)',
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 1,
    comment: '波美度',
    nullable: true,
  })
  baumeDegree: number;

  @Column({
    type: 'tinyint',
    comment: '品质等级: 1成熟蜜 2普通蜜',
    default: 2,
  })
  qualityGrade: number;

  @Column({
    type: 'tinyint',
    comment: '采蜜方式: 1摇蜜机 2手工',
    nullable: true,
  })
  method: number;

  @Column({ type: 'simple-json', comment: '蜂箱ID数组', nullable: true })
  hiveIds: number[];

  @Column({ type: 'simple-json', comment: '照片URL数组', nullable: true })
  photos: string[];

  @Column({ type: 'text', comment: '备注', nullable: true })
  notes: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
