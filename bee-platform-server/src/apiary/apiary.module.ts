import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiaryController } from './apiary.controller';
import { ApiaryService } from './apiary.service';
import { Apiary } from '../entities/apiary.entity';
import { Hive } from '../entities/hive.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Apiary, Hive])],
  controllers: [ApiaryController],
  providers: [ApiaryService],
  exports: [ApiaryService],
})
export class ApiaryModule {}
