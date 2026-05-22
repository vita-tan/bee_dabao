import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 255, comment: '密码（bcrypt哈希）' })
  password: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '手机号',
    nullable: true,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '真实姓名',
    nullable: true,
  })
  realName: string;

  @Column({ type: 'bigint', comment: '角色ID', nullable: true })
  roleId: number;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '管辖区域代码',
    nullable: true,
  })
  regionCode: string;

  @Column({
    type: 'tinyint',
    comment: '状态: 1正常 0停用',
    default: 1,
  })
  status: number;

  @Column({ type: 'datetime', comment: '最后登录时间', nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '最后登录IP',
    nullable: true,
  })
  lastLoginIp: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
