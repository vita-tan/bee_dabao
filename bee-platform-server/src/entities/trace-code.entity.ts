import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('trace_codes')
export class TraceCode {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '溯源码' })
  code: string;

  @Column({ type: 'bigint', comment: '蜂农ID' })
  beekeeperId: number;

  @Column({ type: 'bigint', comment: '蜂场ID', nullable: true })
  apiaryId: number;

  @Column({ type: 'bigint', comment: '采蜜记录ID', nullable: true })
  harvestId: number;

  @Column({ type: 'varchar', length: 100, comment: '产品名称' })
  productName: string;

  @Column({ type: 'varchar', length: 50, comment: '批次号', nullable: true })
  batchNo: string;

  @Column({ type: 'varchar', length: 50, comment: '规格(如250g)' })
  spec: string;

  @Column({ type: 'date', comment: '生产日期' })
  produceDate: Date;

  @Column({
    type: 'tinyint',
    comment: '保质期(月)',
  })
  shelfLifeMonths: number;

  @Column({ type: 'simple-json', comment: '溯源链路数据(JSON)' })
  traceData: Record<string, unknown>;

  @Column({
    type: 'int',
    comment: '扫码次数',
    default: 0,
  })
  scanCount: number;

  @Column({
    type: 'tinyint',
    comment: '状态: 1有效 0撤销',
    default: 1,
  })
  status: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
