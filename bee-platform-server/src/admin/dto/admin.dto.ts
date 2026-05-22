import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';

// ==================== 补贴政策 ====================

export class CreateSubsidyPolicyDto {
  @ApiProperty({ description: '政策名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '适用区域代码数组' })
  @IsOptional()
  @IsArray()
  regionCodes?: string[];

  @ApiPropertyOptional({ description: '适用蜂农类型' })
  @IsOptional()
  @IsArray()
  targetTypes?: number[];

  @ApiProperty({ description: '补贴标准' })
  @IsString()
  @IsNotEmpty()
  standard: string;

  @ApiPropertyOptional({ description: '总预算' })
  @IsOptional()
  @IsNumber()
  totalBudget?: number;

  @ApiPropertyOptional({ description: '申请开始时间' })
  @IsOptional()
  @IsDateString()
  applyStart?: string;

  @ApiPropertyOptional({ description: '申请截止时间' })
  @IsOptional()
  @IsDateString()
  applyEnd?: string;

  @ApiPropertyOptional({ description: '申请条件' })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiPropertyOptional({ description: '所需材料' })
  @IsOptional()
  @IsString()
  materials?: string;
}

export class QuerySubsidyPolicyDto extends PaginationDto {
  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

// ==================== 补贴申请 ====================

export class AuditSubsidyDto {
  @ApiPropertyOptional({ description: '审批金额' })
  @IsOptional()
  @IsNumber()
  approvedAmount?: number;

  @ApiProperty({ description: '审核备注' })
  @IsString()
  @IsNotEmpty()
  auditNote: string;
}

export class BatchPaidDto {
  @ApiProperty({ description: '申请ID数组' })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @ApiPropertyOptional({ description: '发放备注' })
  @IsOptional()
  @IsString()
  paidRemark?: string;
}

export class QuerySubsidyApplicationDto extends PaginationDto {
  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({ description: '政策ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  policyId?: number;

  @ApiPropertyOptional({ description: '蜂农关键字' })
  @IsOptional()
  @IsString()
  beekeeperKeyword?: string;
}

// ==================== 通知管理 ====================

export class CreateNotificationDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '类型: 1政策 2技术指导 3疫情预警 4市场信息 5其他' })
  @IsNumber()
  type: number;

  @ApiProperty({ description: '内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '推送区域代码数组' })
  @IsArray()
  regionCodes: string[];

  @ApiProperty({ description: '推送蜂农类型' })
  @IsArray()
  targetTypes: number[];

  @ApiPropertyOptional({ description: '紧急程度 1普通 2重要 3紧急' })
  @IsOptional()
  @IsNumber()
  urgency?: number;

  @ApiPropertyOptional({ description: '附件URL数组' })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiPropertyOptional({ description: '定时发布时间，不填则立即发布' })
  @IsOptional()
  @IsDateString()
  publishTime?: string;
}

export class QueryNotificationDto extends PaginationDto {
  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({ description: '类型' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  type?: number;
}

// ==================== 系统管理 ====================

export class CreateAdminUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码(8位以上含数字和字母)' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '真实姓名' })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiProperty({ description: '角色ID' })
  @IsNumber()
  roleId: number;

  @ApiProperty({ description: '管辖区域代码' })
  @IsString()
  @IsNotEmpty()
  regionCode: string;
}

export class QueryAdminUserDto extends PaginationDto {
  @ApiPropertyOptional({ description: '关键字' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '角色ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  role?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}

export class CreateDictItemDto {
  @ApiProperty({ description: '字典键' })
  @IsString()
  @IsNotEmpty()
  dictKey: string;

  @ApiProperty({ description: '字典值' })
  @IsString()
  @IsNotEmpty()
  itemValue: string;

  @ApiProperty({ description: '显示文本' })
  @IsString()
  @IsNotEmpty()
  itemLabel: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class QueryOperationLogDto extends PaginationDto {
  @ApiPropertyOptional({ description: '管理员ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  adminId?: number;

  @ApiPropertyOptional({ description: '模块' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: '操作类型' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
