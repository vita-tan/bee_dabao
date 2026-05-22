import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateTraceDto {
  @ApiProperty({ description: '采蜜记录ID' })
  @IsNumber()
  harvestId: number;

  @ApiProperty({ description: '产品名称' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: '规格，如 250g' })
  @IsString()
  @IsNotEmpty()
  spec: string;

  @ApiProperty({ description: '生产日期' })
  @IsDateString()
  produceDate: string;

  @ApiProperty({ description: '保质期(月)' })
  @IsNumber()
  @Min(1)
  shelfLifeMonths: number;

  @ApiPropertyOptional({ description: '批次号' })
  @IsOptional()
  @IsString()
  batchNo?: string;

  @ApiPropertyOptional({ description: '加工过程描述' })
  @IsOptional()
  @IsString()
  processNotes?: string;

  @ApiPropertyOptional({ description: '质检信息(JSON对象)' })
  @IsOptional()
  qualityInfo?: Record<string, any>;
}

export class QueryTraceDto extends PaginationDto {
  // 暂无额外筛选
}
