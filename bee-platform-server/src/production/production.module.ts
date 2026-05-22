import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionController } from './production.controller';
import { HarvestController } from './production.controller';
import { MedicationController } from './production.controller';
import { AccountController } from './production.controller';
import { ProductionService } from './production.service';
import { Inspection } from '../entities/inspection.entity';
import { HoneyHarvest } from '../entities/honey-harvest.entity';
import { Medication } from '../entities/medication.entity';
import { Account } from '../entities/account.entity';
import { Apiary } from '../entities/apiary.entity';
import { Hive } from '../entities/hive.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
      HoneyHarvest,
      Medication,
      Account,
      Apiary,
      Hive,
    ]),
  ],
  controllers: [
    InspectionController,
    HarvestController,
    MedicationController,
    AccountController,
  ],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
