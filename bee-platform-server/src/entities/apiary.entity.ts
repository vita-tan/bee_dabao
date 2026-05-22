import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Beekeeper } from './beekeeper.entity';

@Entity('apiaries')
export class Apiary {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', comment: '蜂农ID' })
  beekeeperId: number;

  @ManyToOne(() => Beekeeper)
  @JoinColumn({ name: 'beekeeper_id' })
  beekeeper: Beekeeper;

  @Column({ type: 'varchar', length: 100, comment: '蜂场名称' })
  name: string;

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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    comment: '经度',
    nullable: true,
  })
  longitude: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    comment: '纬度',
    nullable: true,
  })
  latitude: number;

  @Column({ type: 'int', comment: '海拔(米)', nullable: true })
  altitude: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '蜂种',
    nullable: true,
  })
  beeBreed: string;

  @Column({ type: 'int', comment: '蜂箱数', default: 0 })
  boxCount: number;

  @Column({ type: 'int', comment: '蜂群数', default: 0 })
  colonyCount: number;

  @Column({
    type: 'varchar',
    length: 200,
    comment: '蜜源',
    nullable: true,
  })
  honeySource: string;

  @Column({ type: 'simple-json', comment: '照片URL数组', nullable: true })
  photos: string[];

  @Column({
    type: 'tinyint',
    comment: '是否季节性蜂场: 0否 1是',
    default: 0,
  })
  isSeasonal: number;

  @Column({
    type: 'tinyint',
    comment: '状态: 1正常 0停用',
    default: 1,
  })
  status: number;

  @Column({
    type: 'datetime',
    comment: '最后巡查时间',
    nullable: true,
  })
  lastInspectAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
