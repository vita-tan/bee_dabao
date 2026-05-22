import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TraceController, TracePublicController, UploadController } from './trace.controller';
import { TraceService } from './trace.service';
import { UploadService } from './upload.service';
import { TraceCode } from '../entities/trace-code.entity';
import { Beekeeper } from '../entities/beekeeper.entity';
import { Apiary } from '../entities/apiary.entity';
import { HoneyHarvest } from '../entities/honey-harvest.entity';
import { Medication } from '../entities/medication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TraceCode, Beekeeper, Apiary, HoneyHarvest, Medication]),
  ],
  controllers: [TraceController, TracePublicController, UploadController],
  providers: [TraceService, UploadService],
  exports: [TraceService, UploadService],
})
export class TraceModule {}
