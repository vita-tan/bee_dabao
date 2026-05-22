import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** 蜂农微信登录 */
export class WechatLoginDto {
  @ApiProperty({ description: '微信小程序登录code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

/** 蜂农绑定手机号 */
export class BindPhoneDto {
  @ApiProperty({ description: '临时token' })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({ description: '微信手机号授权code' })
  @IsString()
  @IsNotEmpty()
  phoneCode: string;
}

/** 蜂农注册/补充信息 */
export class BeekeeperRegisterDto {
  @ApiProperty({ description: '姓名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '身份证号' })
  @IsOptional()
  @IsString()
  idCard?: string;

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

  @ApiPropertyOptional({ description: '详细地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '养蜂年限' })
  @IsOptional()
  expYears?: number;

  @ApiPropertyOptional({ description: '蜂种' })
  @IsOptional()
  @IsString()
  beeBreed?: string;

  @ApiPropertyOptional({ description: '蜂农证号' })
  @IsOptional()
  @IsString()
  certNo?: string;

  @ApiPropertyOptional({ description: '蜂农证图片URL' })
  @IsOptional()
  @IsString()
  certImage?: string;
}

/** 更新蜂农个人信息（非实名） */
export class UpdateBeekeeperProfileDto {
  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '蜂种' })
  @IsOptional()
  @IsString()
  beeBreed?: string;
}

/** H5 调试登录（仅开发环境） */
export class DevLoginDto {
  @ApiProperty({ description: '蜂农手机号' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

/** 管理员登录 */
export class AdminLoginDto {
  @ApiPropertyOptional({ description: '用户名' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: '手机号（备用登录）' })
  @IsOptional()
  @IsString()
  phone?: string;
}

/** 修改密码 */
export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
