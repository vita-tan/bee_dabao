import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('subsidy_policies')
export class SubsidyPolicy {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '政策名称' })
  name: string;

  @Column({
    type: 'simple-json',
    comment: '适用区域代码数组',
    nullable: true,
  })
  regionCodes: string[];

  @Column({
    type: 'simple-json',
    comment: '适用蜂农类型数组',
    nullable: true,
  })
  targetTypes: number[];

  @Column({ type: 'text', comment: '补贴标准说明' })
  standard: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '总预算',
    default: 0,
  })
  totalBudget: number;

  @Column({ type: 'datetime', comment: '申请开始时间', nullable: true })
  applyStart: Date;

  @Column({ type: 'datetime', comment: '申请截止时间', nullable: true })
  applyEnd: Date;

  @Column({ type: 'text', comment: '申请条件', nullable: true })
  conditions: string;

  @Column({ type: 'text', comment: '所需材料说明', nullable: true })
  materials: string;

  @Column({
    type: 'tinyint',
    comment: '状态: 0草稿 1已发布 2已结束',
    default: 0,
  })
  status: number;

  @Column({ type: 'bigint', comment: '创建人ID' })
  createdBy: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
