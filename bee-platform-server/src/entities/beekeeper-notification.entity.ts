import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Beekeeper } from '../entities/beekeeper.entity';
import { Notification } from '../entities/notification.entity';

@Entity('beekeeper_notifications')
export class BeekeeperNotification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', comment: '通知ID' })
  notificationId: number;

  @ManyToOne(() => Notification)
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @Column({ type: 'bigint', comment: '蜂农ID' })
  beekeeperId: number;

  @ManyToOne(() => Beekeeper)
  @JoinColumn({ name: 'beekeeper_id' })
  beekeeper: Beekeeper;

  @Column({ type: 'tinyint', comment: '是否已读: 0否 1是', default: 0 })
  isRead: number;

  @Column({ type: 'datetime', comment: '阅读时间', nullable: true })
  readAt: Date;
}
