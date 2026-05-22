import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', comment: '蜂农ID' })
  beekeeperId: number;

  @Column({
    type: 'tinyint',
    comment: '类型: 1收入 2支出',
  })
  type: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '金额',
  })
  amount: number;

  @Column({ type: 'varchar', length: 50, comment: '分类' })
  category: string;

  @Column({ type: 'date', comment: '记录日期' })
  recordDate: Date;

  @Column({ type: 'varchar', length: 500, comment: '备注', nullable: true })
  notes: string;

  @Column({
    type: 'simple-json',
    comment: '收据图片URL数组',
    nullable: true,
  })
  receiptImages: string[];

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
