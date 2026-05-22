import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import {
  AdminBeekeeperController,
  SubsidyPolicyController,
  SubsidyApplicationController,
  AdminNotificationController,
  AppNotificationController,
  SystemUserController,
  StatsController,
} from './admin.controller';
import { Beekeeper } from '../entities/beekeeper.entity';
import { Admin } from '../entities/admin.entity';
import { Apiary } from '../entities/apiary.entity';
import { Inspection } from '../entities/inspection.entity';
import { HoneyHarvest } from '../entities/honey-harvest.entity';
import { Medication } from '../entities/medication.entity';
import { SubsidyPolicy } from '../entities/subsidy-policy.entity';
import { SubsidyApplication } from '../entities/subsidy-application.entity';
import { Notification } from '../entities/notification.entity';
import { BeekeeperNotification } from '../entities/beekeeper-notification.entity';
import { Account } from '../entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beekeeper, Admin, Apiary, Inspection, HoneyHarvest, Medication,
      SubsidyPolicy, SubsidyApplication, Notification, BeekeeperNotification, Account,
    ]),
  ],
  controllers: [
    AdminBeekeeperController,
    SubsidyPolicyController,
    SubsidyApplicationController,
    AdminNotificationController,
    AppNotificationController,
    SystemUserController,
    StatsController,
  ],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
