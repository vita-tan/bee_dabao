import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Beekeeper } from './beekeeper.entity';
import { SubsidyPolicy } from './subsidy-policy.entity';

@Entity('subsidy_applications')
export class SubsidyApplication {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', comment: '政策ID' })
  policyId: number;

  @ManyToOne(() => SubsidyPolicy)
  @JoinColumn({ name: 'policy_id' })
  policy: SubsidyPolicy;

  @Column({ type: 'bigint', comment: '蜂农ID' })
  beekeeperId: number;

  @ManyToOne(() => Beekeeper)
  @JoinColumn({ name: 'beekeeper_id' })
  beekeeper: Beekeeper;

  @Column({
    type: 'simple-json',
    comment: '关联蜂场ID数组',
    nullable: true,
  })
  apiaryIds: number[];

  @Column({ type: 'int', comment: '蜂群数' })
  colonyCount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '申请金额',
  })
  applyAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '审批金额',
    nullable: true,
  })
  approvedAmount: number;

  @Column({
    type: 'simple-json',
    comment: '申请材料URL数组',
    nullable: true,
  })
  materials: string[];

  @Column({
    type: 'tinyint',
    comment: '状态: 0待审核 1审核中 2已通过 3已拒绝 4已发放',
    default: 0,
  })
  status: number;

  @Column({ type: 'text', comment: '审核备注', nullable: true })
  auditNote: string;

  @Column({ type: 'bigint', comment: '审核人ID', nullable: true })
  auditedBy: number;

  @Column({ type: 'datetime', comment: '审核时间', nullable: true })
  auditedAt: Date;

  @Column({ type: 'datetime', comment: '发放时间', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
