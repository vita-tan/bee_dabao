import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', comment: '蜂场ID' })
  apiaryId: number;

  @Column({ type: 'bigint', comment: '蜂农ID' })
  beekeeperId: number;

  @Column({ type: 'simple-json', comment: '蜂箱ID数组' })
  hiveIds: number[];

  @Column({ type: 'date', comment: '用药日期' })
  medDate: Date;

  @Column({ type: 'varchar', length: 100, comment: '病害名称' })
  diseaseName: string;

  @Column({ type: 'varchar', length: 100, comment: '药品名称' })
  drugName: string;

  @Column({ type: 'varchar', length: 200, comment: '剂量' })
  dosage: string;

  @Column({
    type: 'tinyint',
    comment: '用药方式: 1喷雾 2涂抹 3饲喂 4熏蒸',
  })
  medMethod: number;

  @Column({
    type: 'tinyint',
    comment: '停药天数',
  })
  withdrawDays: number;

  @Column({
    type: 'date',
    comment: '停药期截止日（自动计算）',
    nullable: true,
  })
  withdrawEnd: Date;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '操作人',
    nullable: true,
  })
  operator: string;

  @Column({ type: 'simple-json', comment: '照片URL数组', nullable: true })
  photos: string[];

  @Column({ type: 'text', comment: '备注', nullable: true })
  notes: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
