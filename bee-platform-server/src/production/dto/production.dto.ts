import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

// ==================== 巡查记录 ====================

export class CreateInspectionDto {
  @ApiProperty({ description: '蜂场ID' })
  @IsNumber()
  apiaryId: number;

  @ApiProperty({ description: '巡查日期' })
  @IsDateString()
  inspectDate: string;

  @ApiPropertyOptional({ description: '巡查类型: 1日常 2繁殖期 3病害排查 4转场前' })
  @IsOptional()
  @IsNumber()
  inspectType?: number;

  @ApiProperty({ description: '蜂箱ID数组' })
  @IsArray()
  @IsNumber({}, { each: true })
  hiveIds: number[];

  @ApiProperty({ description: '整体健康: 1良好 2正常 3需关注 4异常' })
  @IsNumber()
  overallHealth: number;

  @ApiPropertyOptional({ description: '蜂王状况 1-3' })
  @IsOptional()
  @IsNumber()
  queenStatus?: number;

  @ApiPropertyOptional({ description: '子脾状况 1-3' })
  @IsOptional()
  @IsNumber()
  broodStatus?: number;

  @ApiPropertyOptional({ description: '蜂蜜储量 1-3' })
  @IsOptional()
  @IsNumber()
  honeyStorage?: number;

  @ApiPropertyOptional({ description: '照片URL数组' })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class QueryInspectionDto extends PaginationDto {
  @ApiPropertyOptional({ description: '蜂场ID筛选' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  apiaryId?: number;
}

// ==================== 采蜜记录 ====================

export class CreateHarvestDto {
  @ApiProperty({ description: '蜂场ID' })
  @IsNumber()
  apiaryId: number;

  @ApiProperty({ description: '采蜜日期' })
  @IsDateString()
  harvestDate: string;

  @ApiProperty({ description: '蜜种' })
  @IsString()
  @IsNotEmpty()
  honeyType: string;

  @ApiProperty({ description: '产量(kg)' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({ description: '波美度' })
  @IsOptional()
  @IsNumber()
  baumeDegree?: number;

  @ApiPropertyOptional({ description: '采蜜方式: 1摇蜜机 2手工' })
  @IsOptional()
  @IsNumber()
  method?: number;

  @ApiPropertyOptional({ description: '蜂箱ID数组' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  hiveIds?: number[];

  @ApiPropertyOptional({ description: '照片URL数组' })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryHarvestDto extends PaginationDto {
  @ApiPropertyOptional({ description: '蜂场ID筛选' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  apiaryId?: number;
}

// ==================== 用药记录 ====================

export class CreateMedicationDto {
  @ApiProperty({ description: '蜂场ID' })
  @IsNumber()
  apiaryId: number;

  @ApiProperty({ description: '蜂箱ID数组' })
  @IsArray()
  @IsNumber({}, { each: true })
  hiveIds: number[];

  @ApiProperty({ description: '用药日期' })
  @IsDateString()
  medDate: string;

  @ApiProperty({ description: '病害名称' })
  @IsString()
  @IsNotEmpty()
  diseaseName: string;

  @ApiProperty({ description: '药品名称' })
  @IsString()
  @IsNotEmpty()
  drugName: string;

  @ApiProperty({ description: '剂量' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({ description: '用药方式: 1喷雾 2涂抹 3饲喂 4熏蒸' })
  @IsNumber()
  medMethod: number;

  @ApiProperty({ description: '停药天数(1-365)' })
  @IsNumber()
  @Min(1)
  @Max(365)
  withdrawDays: number;

  @ApiPropertyOptional({ description: '操作人' })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiPropertyOptional({ description: '照片URL数组' })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryMedicationDto extends PaginationDto {
  @ApiPropertyOptional({ description: '蜂场ID筛选' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  apiaryId?: number;
}

// ==================== 收支记录 ====================

export class CreateAccountDto {
  @ApiProperty({ description: '类型: 1收入 2支出' })
  @IsNumber()
  type: number;

  @ApiProperty({ description: '金额' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: '分类' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: '记录日期' })
  @IsDateString()
  recordDate: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '收据图片URL数组' })
  @IsOptional()
  @IsArray()
  receiptImages?: string[];
}

export class QueryAccountDto extends PaginationDto {
  @ApiPropertyOptional({ description: '类型筛选: 1收入 2支出' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  type?: number;
}
