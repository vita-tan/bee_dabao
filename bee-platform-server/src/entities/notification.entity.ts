import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '标题' })
  title: string;

  @Column({
    type: 'tinyint',
    comment: '类型: 1政策 2技术指导 3疫情预警 4市场信息 5其他',
  })
  type: number;

  @Column({ type: 'text', comment: '内容' })
  content: string;

  @Column({
    type: 'simple-json',
    comment: '推送区域代码数组',
    nullable: true,
  })
  regionCodes: string[];

  @Column({
    type: 'simple-json',
    comment: '推送蜂农类型数组',
    nullable: true,
  })
  targetTypes: number[];

  @Column({
    type: 'tinyint',
    comment: '紧急程度: 1普通 2重要 3紧急',
    default: 1,
  })
  urgency: number;

  @Column({
    type: 'simple-json',
    comment: '附件URL数组',
    nullable: true,
  })
  attachments: string[];

  @Column({ type: 'datetime', comment: '发布时间', nullable: true })
  publishTime: Date;

  @Column({
    type: 'tinyint',
    comment: '状态: 0草稿 1已发布 2已撤回',
    default: 0,
  })
  status: number;

  @Column({ type: 'bigint', comment: '创建人ID' })
  createdBy: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
