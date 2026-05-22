import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('beekeepers')
export class Beekeeper {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, comment: '微信openid' })
  openid: string;

  @Column({ type: 'varchar', length: 20, unique: true, comment: '手机号' })
  phone: string;

  @Column({ type: 'varchar', length: 50, comment: '姓名' })
  name: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '身份证号（加密存储）',
    nullable: true,
  })
  idCard: string;

  @Column({ type: 'varchar', length: 500, comment: '头像URL', nullable: true })
  avatar: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '行政区代码',
    nullable: true,
  })
  regionCode: string;

  @Column({ type: 'varchar', length: 50, comment: '省', nullable: true })
  province: string;

  @Column({ type: 'varchar', length: 50, comment: '市', nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 50, comment: '区/县', nullable: true })
  district: string;

  @Column({ type: 'varchar', length: 50, comment: '乡镇', nullable: true })
  town: string;

  @Column({ type: 'varchar', length: 200, comment: '详细地址', nullable: true })
  address: string;

  @Column({ type: 'tinyint', comment: '养蜂年限', default: 0 })
  expYears: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '蜂种',
    nullable: true,
  })
  beeBreed: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: '蜂农证号',
    nullable: true,
  })
  certNo: string;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '蜂农证图片',
    nullable: true,
  })
  certImage: string;

  @Column({
    type: 'tinyint',
    comment: '等级: 1散户 2专业 3企业',
    default: 1,
  })
  level: number;

  @Column({
    type: 'tinyint',
    comment: '信用分',
    default: 80,
  })
  creditScore: number;

  @Column({
    type: 'tinyint',
    comment: '状态: 0待审核 1正常 2冻结 3拒绝',
    default: 0,
  })
  status: number;

  @Column({
    type: 'varchar',
    length: 500,
    comment: '审核备注',
    nullable: true,
  })
  auditNote: string;

  @Column({ type: 'datetime', comment: '审核时间', nullable: true })
  auditedAt: Date;

  @Column({ type: 'bigint', comment: '审核人ID', nullable: true })
  auditedBy: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
