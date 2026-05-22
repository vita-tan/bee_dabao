import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', comment: '蜂场ID' })
  apiaryId: number;

  @Column({ type: 'bigint', comment: '蜂农ID' })
  beekeeperId: number;

  @Column({ type: 'date', comment: '巡查日期' })
  inspectDate: Date;

  @Column({
    type: 'tinyint',
    comment: '巡查类型: 1日常 2繁殖期 3病害排查 4转场前',
  })
  inspectType: number;

  @Column({ type: 'simple-json', comment: '蜂箱ID数组', nullable: true })
  hiveIds: number[];

  @Column({ type: 'int', comment: '巡查蜂箱数' })
  hiveCount: number;

  @Column({
    type: 'tinyint',
    comment: '整体健康: 1良好 2正常 3需关注 4异常',
  })
  overallHealth: number;

  @Column({
    type: 'tinyint',
    comment: '蜂王状况: 1正常 2异常 3待观察',
    nullable: true,
  })
  queenStatus: number;

  @Column({
    type: 'tinyint',
    comment: '子脾状况: 1良好 2一般 3较差',
    nullable: true,
  })
  broodStatus: number;

  @Column({
    type: 'tinyint',
    comment: '蜂蜜储量: 1充足 2一般 3不足',
    nullable: true,
  })
  honeyStorage: number;

  @Column({ type: 'simple-json', comment: '照片URL数组', nullable: true })
  photos: string[];

  @Column({ type: 'text', comment: '备注', nullable: true })
  notes: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
