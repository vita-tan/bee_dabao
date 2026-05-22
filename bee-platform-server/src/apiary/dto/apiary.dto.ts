import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 创建蜂场 */
export class CreateApiaryDto {
  @ApiProperty({ description: '蜂场名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '详细地址' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: '经度' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: '纬度' })
  @IsNumber()
  latitude: number;

  @ApiPropertyOptional({ description: '海拔(米)' })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiProperty({ description: '蜂种' })
  @IsString()
  @IsNotEmpty()
  beeBreed: string;

  @ApiProperty({ description: '蜂箱数' })
  @IsNumber()
  boxCount: number;

  @ApiProperty({ description: '蜂群数' })
  @IsNumber()
  colonyCount: number;

  @ApiPropertyOptional({ description: '蜜源' })
  @IsOptional()
  @IsString()
  honeySource?: string;

  @ApiPropertyOptional({ description: '照片URL数组' })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiPropertyOptional({ description: '是否季节性蜂场' })
  @IsOptional()
  @IsBoolean()
  isSeasonal?: boolean;

  @ApiPropertyOptional({ description: '省' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: '市' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '区/县' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: '乡镇' })
  @IsOptional()
  @IsString()
  town?: string;

  @ApiPropertyOptional({ description: '行政区代码' })
  @IsOptional()
  @IsString()
  regionCode?: string;
}

/** 更新蜂场 */
export class UpdateApiaryDto {
  @ApiPropertyOptional({ description: '蜂场名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '海拔(米)' })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiPropertyOptional({ description: '蜂种' })
  @IsOptional()
  @IsString()
  beeBreed?: string;

  @ApiPropertyOptional({ description: '蜂箱数' })
  @IsOptional()
  @IsNumber()
  boxCount?: number;

  @ApiPropertyOptional({ description: '蜂群数' })
  @IsOptional()
  @IsNumber()
  colonyCount?: number;

  @ApiPropertyOptional({ description: '蜜源' })
  @IsOptional()
  @IsString()
  honeySource?: string;

  @ApiPropertyOptional({ description: '照片URL数组' })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiPropertyOptional({ description: '是否季节性蜂场' })
  @IsOptional()
  @IsBoolean()
  isSeasonal?: boolean;
}

/** 创建蜂箱 */
export class CreateHiveDto {
  @ApiProperty({ description: '蜂箱编号' })
  @IsString()
  @IsNotEmpty()
  hiveNo: string;

  @ApiPropertyOptional({ description: '蜂种' })
  @IsOptional()
  @IsString()
  beeBreed?: string;

  @ApiPropertyOptional({ description: '引入日期' })
  @IsOptional()
  hiveDate?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/** 批量创建蜂箱 */
export class BatchCreateHiveDto {
  @ApiProperty({ description: '起始编号，如 A01' })
  @IsString()
  @IsNotEmpty()
  startNo: string;

  @ApiProperty({ description: '创建数量' })
  @IsNumber()
  count: number;

  @ApiPropertyOptional({ description: '蜂种' })
  @IsOptional()
  @IsString()
  beeBreed?: string;
}

/** 更新蜂箱 */
export class UpdateHiveDto {
  @ApiPropertyOptional({ description: '健康状态 1正常 2异常 3待观察' })
  @IsOptional()
  @IsNumber()
  health?: number;

  @ApiPropertyOptional({ description: '蜂王状态 1正常 2失王 3待确认' })
  @IsOptional()
  @IsNumber()
  queenStatus?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}
