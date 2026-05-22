import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  QuerySubsidyPolicyDto,
  QuerySubsidyApplicationDto,
  QueryNotificationDto,
  CreateSubsidyPolicyDto,
  AuditSubsidyDto,
  BatchPaidDto,
  CreateNotificationDto,
  CreateAdminUserDto,
  QueryAdminUserDto,
} from './dto/admin.dto';
import { JwtAdminGuard } from '../common/guards/jwt-admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtBeekeeperGuard } from '../common/guards/jwt-beekeeper.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

// 简化的蜂农查询参数
class QueryBkDto extends PaginationDto {
  keyword?: string;
  status?: number;
  level?: number;
  regionCode?: string;
  creditMin?: number;
  creditMax?: number;
  registerStart?: string;
  registerEnd?: string;
}

// ==================== 蜂农管理 ====================

@ApiTags('蜂农管理（管理端）')
@Controller('admin/beekeepers')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth()
export class AdminBeekeeperController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '蜂农列表' })
  list(@Query() dto: QueryBkDto, @CurrentUser() admin: any) {
    return this.adminService.listBeekeepers(admin, dto);
  }

  @Get('pending')
  @ApiOperation({ summary: '待审核列表' })
  pending(@CurrentUser() admin: any) {
    return this.adminService.pendingBeekeepers(admin);
  }

  @Get(':id')
  @ApiOperation({ summary: '蜂农详情' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getBeekeeperDetail(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: '审核通过' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') adminId: number,
    @Body() dto: { auditNote?: string },
  ) {
    return this.adminService.approveBeekeeper(id, adminId, dto.auditNote);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: '审核拒绝' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') adminId: number,
    @Body() body: { auditNote: string },
  ) {
    return this.adminService.rejectBeekeeper(id, adminId, body.auditNote);
  }

  @Put(':id/freeze')
  @ApiOperation({ summary: '冻结/解冻' })
  freeze(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { freeze: boolean; reason: string },
  ) {
    return this.adminService.freezeBeekeeper(id, body.freeze, body.reason);
  }

  @Get(':id/records')
  @ApiOperation({ summary: '蜂农记录汇总' })
  records(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getBeekeeperRecords(id);
  }
}

// ==================== 补贴政策 ====================

@ApiTags('补贴政策（管理端）')
@Controller('admin/subsidy/policies')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth()
export class SubsidyPolicyController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '政策列表' })
  list(@Query() dto: QuerySubsidyPolicyDto, @CurrentUser() admin: any) {
    return this.adminService.listPolicies(admin, dto);
  }

  @Post()
  @ApiOperation({ summary: '新建政策' })
  create(@Body() dto: CreateSubsidyPolicyDto, @CurrentUser('id') adminId: number) {
    return this.adminService.createPolicy(dto, adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: '政策详情' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getPolicyDetail(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑政策' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateSubsidyPolicyDto>) {
    return this.adminService.updatePolicy(id, dto);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: '发布政策' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.publishPolicy(id);
  }

  @Put(':id/close')
  @ApiOperation({ summary: '关闭政策' })
  close(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.closePolicy(id);
  }
}

// ==================== 补贴申请 ====================

@ApiTags('补贴申请（管理端）')
@Controller('admin/subsidy/applications')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth()
export class SubsidyApplicationController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '申请列表' })
  list(@Query() dto: QuerySubsidyApplicationDto) {
    return this.adminService.listApplications(null, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '申请详情' })
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getApplicationDetail(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: '审批通过' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') adminId: number,
    @Body() dto: AuditSubsidyDto,
  ) {
    return this.adminService.approveApplication(id, adminId, dto);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: '审批拒绝' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') adminId: number,
    @Body() dto: AuditSubsidyDto,
  ) {
    return this.adminService.rejectApplication(id, adminId, dto);
  }

  @Put(':id/paid')
  @ApiOperation({ summary: '标记发放' })
  paid(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.paidApplication(id);
  }

  @Post('batch-paid')
  @ApiOperation({ summary: '批量标记发放' })
  batchPaid(@Body() dto: BatchPaidDto) {
    return this.adminService.batchPaid(dto);
  }

  @Get('summary/summary')
  @ApiOperation({ summary: '补贴汇总统计' })
  summary() {
    return this.adminService.getSubsidySummary();
  }
}

// ==================== 通知管理 ====================

@ApiTags('通知管理（管理端）')
@Controller('admin/notifications')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth()
export class AdminNotificationController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: '创建通知' })
  create(@Body() dto: CreateNotificationDto, @CurrentUser('id') adminId: number) {
    return this.adminService.createNotification(dto, adminId);
  }

  @Get()
  @ApiOperation({ summary: '通知列表' })
  list(@Query() dto: QueryNotificationDto) {
    return this.adminService.listNotifications(dto);
  }

  @Put(':id/revoke')
  @ApiOperation({ summary: '撤回通知' })
  revoke(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.revokeNotification(id);
  }
}

// ==================== 蜂农端通知 ====================

@ApiTags('通知（蜂农端）')
@Controller('app/notifications')
@UseGuards(JwtBeekeeperGuard)
@ApiBearerAuth()
export class AppNotificationController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '我的通知列表' })
  list(@Query() dto: any, @CurrentUser('id') beekeeperId: number) {
    return this.adminService.listMyNotifications(beekeeperId, dto);
  }

  @Put(':id/read')
  @ApiOperation({ summary: '标记已读' })
  markRead(@Param('id', ParseIntPipe) notificationId: number, @CurrentUser('id') beekeeperId: number) {
    return this.adminService.markRead(beekeeperId, notificationId);
  }

  @Put('read-all')
  @ApiOperation({ summary: '全部已读' })
  markAllRead(@CurrentUser('id') beekeeperId: number) {
    return this.adminService.markAllRead(beekeeperId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '未读数量' })
  unreadCount(@CurrentUser('id') beekeeperId: number) {
    return this.adminService.getUnreadCount(beekeeperId);
  }
}

// ==================== 系统管理 ====================

@ApiTags('用户管理（系统）')
@Controller('admin/system/users')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth()
export class SystemUserController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: '用户列表' })
  list(@Query() dto: QueryAdminUserDto) {
    return this.adminService.listAdminUsers(dto);
  }

  @Post()
  @ApiOperation({ summary: '新建用户' })
  create(@Body() dto: CreateAdminUserDto) {
    return this.adminService.createAdminUser(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑用户' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateAdminUserDto>) {
    return this.adminService.updateAdminUser(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '启用/停用' })
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleAdminStatus(id);
  }

  @Put(':id/reset-password')
  @ApiOperation({ summary: '重置密码' })
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.resetAdminPassword(id);
  }
}

// ==================== 数据统计 ====================

@ApiTags('数据统计（管理端）')
@Controller('admin/stats')
@UseGuards(JwtAdminGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: '总览数据' })
  overview(@CurrentUser() admin: any) {
    return this.adminService.getOverview(admin);
  }
}
