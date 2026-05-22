import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Beekeeper } from '../entities/beekeeper.entity';
import { Admin } from '../entities/admin.entity';
import { Apiary } from '../entities/apiary.entity';
import { Hive } from '../entities/hive.entity';
import { Inspection } from '../entities/inspection.entity';
import { HoneyHarvest } from '../entities/honey-harvest.entity';
import { Medication } from '../entities/medication.entity';
import { TraceCode } from '../entities/trace-code.entity';
import { SubsidyPolicy } from '../entities/subsidy-policy.entity';
import { SubsidyApplication } from '../entities/subsidy-application.entity';
import { Notification } from '../entities/notification.entity';
import { BeekeeperNotification } from '../entities/beekeeper-notification.entity';
import { Account } from '../entities/account.entity';
import { QuerySubsidyPolicyDto, QuerySubsidyApplicationDto, QueryNotificationDto, CreateSubsidyPolicyDto, AuditSubsidyDto, BatchPaidDto, CreateNotificationDto, CreateAdminUserDto, QueryAdminUserDto, CreateDictItemDto, QueryOperationLogDto } from './dto/admin.dto';
import { paginate, PaginatedResult, PaginationDto } from '../common/dto/pagination.dto';

// 简化的蜂农查询
interface QueryBeekeeperDto extends PaginationDto {
  keyword?: string;
  status?: number;
  level?: number;
  regionCode?: string;
  creditMin?: number;
  creditMax?: number;
  registerStart?: string;
  registerEnd?: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Beekeeper)
    private beekeeperRepo: Repository<Beekeeper>,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    @InjectRepository(Apiary)
    private apiaryRepo: Repository<Apiary>,
    @InjectRepository(SubsidyPolicy)
    private policyRepo: Repository<SubsidyPolicy>,
    @InjectRepository(SubsidyApplication)
    private applicationRepo: Repository<SubsidyApplication>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(BeekeeperNotification)
    private bkNotificationRepo: Repository<BeekeeperNotification>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(Inspection)
    private inspectionRepo: Repository<Inspection>,
    @InjectRepository(HoneyHarvest)
    private harvestRepo: Repository<HoneyHarvest>,
    @InjectRepository(Medication)
    private medicationRepo: Repository<Medication>,
  ) {}

  // ==================== 蜂农管理 ====================

  async listBeekeepers(admin: any, dto: QueryBeekeeperDto): Promise<PaginatedResult<any>> {
    const qb = this.beekeeperRepo.createQueryBuilder('b');

    // 区域数据隔离
    if (admin.regionCode) {
      qb.andWhere('b.region_code LIKE :rc', { rc: `${admin.regionCode}%` });
    }

    if (dto.keyword) {
      qb.andWhere('(b.name LIKE :kw OR b.phone LIKE :kw)', { kw: `%${dto.keyword}%` });
    }
    if (dto.status !== undefined) qb.andWhere('b.status = :s', { s: dto.status });
    if (dto.level !== undefined) qb.andWhere('b.level = :l', { l: dto.level });
    if (dto.regionCode) qb.andWhere('b.region_code LIKE :rc', { rc: `${dto.regionCode}%` });
    if (dto.creditMin !== undefined) qb.andWhere('b.credit_score >= :cm', { cm: dto.creditMin });
    if (dto.creditMax !== undefined) qb.andWhere('b.credit_score <= :cmx', { cmx: dto.creditMax });
    if (dto.registerStart) qb.andWhere('b.created_at >= :rs', { rs: dto.registerStart });
    if (dto.registerEnd) qb.andWhere('b.created_at <= :re', { re: dto.registerEnd });

    qb.orderBy('b.created_at', 'DESC');

    const [list, total] = await qb
      .skip(dto.skip)
      .take(dto.pageSize)
      .getManyAndCount();

    // 手机号脱敏
    const sanitized = list.map((b) => ({
      id: b.id,
      name: b.name,
      phone: this.maskPhone(b.phone),
      region: [b.province, b.city, b.district, b.town].filter(Boolean).join(''),
      status: b.status,
      creditScore: b.creditScore,
      level: b.level,
      createdAt: b.createdAt,
    }));

    return paginate(sanitized, total, dto);
  }

  async pendingBeekeepers(admin: any) {
    const now = new Date();
    const urgentThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const list = await this.beekeeperRepo.find({
      where: { status: 0 },
      order: { createdAt: 'ASC' },
    });

    return list.map((b) => ({
      ...b,
      phone: this.maskPhone(b.phone),
      idCard: this.maskIdCard(b.idCard),
      isUrgent: b.createdAt < urgentThreshold,
    }));
  }

  async getBeekeeperDetail(id: number) {
    const b = await this.beekeeperRepo.findOne({ where: { id } });
    if (!b) throw new BadRequestException('蜂农不存在');

    const apiaries = await this.apiaryRepo.find({
      where: { beekeeperId: id, status: 1 },
      select: ['id', 'name', 'address', 'colonyCount', 'boxCount'],
    });

    const subsidyStats = await this.applicationRepo
      .createQueryBuilder('sa')
      .select('COUNT(*)', 'totalApplications')
      .addSelect('COALESCE(SUM(CASE WHEN sa.status >= 2 THEN sa.approved_amount ELSE 0 END), 0)', 'totalApproved')
      .where('sa.beekeeper_id = :id', { id })
      .getRawOne();

    return {
      ...b,
      phone: this.maskPhone(b.phone),
      idCard: this.maskIdCard(b.idCard),
      apiaries,
      subsidyStats: {
        totalApplications: parseInt(subsidyStats.totalApplications) || 0,
        totalApproved: parseFloat(subsidyStats.totalApproved) || 0,
      },
    };
  }

  async approveBeekeeper(id: number, adminId: number, auditNote?: string) {
    await this.beekeeperRepo.update(id, {
      status: 1,
      auditedAt: new Date(),
      auditedBy: adminId,
      auditNote,
    });
    // TODO: 触发微信订阅消息
    return { message: '审核通过' };
  }

  async rejectBeekeeper(id: number, adminId: number, auditNote: string) {
    await this.beekeeperRepo.update(id, {
      status: 3,
      auditedAt: new Date(),
      auditedBy: adminId,
      auditNote,
    });
    // TODO: 触发微信订阅消息
    return { message: '已拒绝' };
  }

  async freezeBeekeeper(id: number, freeze: boolean, reason: string) {
    await this.beekeeperRepo.update(id, {
      status: freeze ? 2 : 1,
      auditNote: reason,
    });
    return { message: freeze ? '已冻结' : '已解冻' };
  }

  async getBeekeeperRecords(id: number) {
    const [inspections, harvests, medications, applications] = await Promise.all([
      this.inspectionRepo.find({ where: { beekeeperId: id }, order: { inspectDate: 'DESC' }, take: 50 }),
      this.harvestRepo.find({ where: { beekeeperId: id }, order: { harvestDate: 'DESC' }, take: 50 }),
      this.medicationRepo.find({ where: { beekeeperId: id }, order: { medDate: 'DESC' }, take: 50 }),
      this.applicationRepo.find({ where: { beekeeperId: id }, order: { createdAt: 'DESC' } }),
    ]);
    return { inspections, harvests, medications, applications };
  }

  // ==================== 补贴政策 ====================

  async listPolicies(admin: any, dto: QuerySubsidyPolicyDto): Promise<PaginatedResult<SubsidyPolicy>> {
    const where: any = {};
    if (dto.status !== undefined) where.status = dto.status;

    const [list, total] = await this.policyRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: dto.skip,
      take: dto.pageSize,
    });
    return paginate(list, total, dto);
  }

  async createPolicy(dto: CreateSubsidyPolicyDto, adminId: number) {
    const policy = this.policyRepo.create({
      ...dto,
      status: 0,
      createdBy: adminId,
    });
    return this.policyRepo.save(policy);
  }

  async getPolicyDetail(id: number) {
    const policy = await this.policyRepo.findOne({ where: { id } });
    if (!policy) throw new BadRequestException('政策不存在');

    const stats = await this.applicationRepo
      .createQueryBuilder('sa')
      .select('COUNT(*)', 'total')
      .addSelect('COALESCE(SUM(sa.apply_amount), 0)', 'totalApply')
      .addSelect('COALESCE(SUM(sa.approved_amount), 0)', 'totalApproved')
      .where('sa.policy_id = :id', { id })
      .getRawOne();

    return {
      ...policy,
      stats: {
        totalApplications: parseInt(stats.total) || 0,
        totalApplyAmount: parseFloat(stats.totalApply) || 0,
        totalApprovedAmount: parseFloat(stats.totalApproved) || 0,
      },
    };
  }

  async updatePolicy(id: number, dto: Partial<CreateSubsidyPolicyDto>) {
    const policy = await this.policyRepo.findOne({ where: { id, status: 0 } });
    if (!policy) throw new BadRequestException('政策不存在或已发布');
    Object.assign(policy, dto);
    return this.policyRepo.save(policy);
  }

  async publishPolicy(id: number) {
    const policy = await this.policyRepo.findOne({ where: { id, status: 0 } });
    if (!policy) throw new BadRequestException('政策不存在或状态不允许发布');
    policy.status = 1;
    await this.policyRepo.save(policy);
    // TODO: 触发通知推送给符合条件区域的蜂农
    return { message: '发布成功' };
  }

  async closePolicy(id: number) {
    await this.policyRepo.update(id, { status: 2 });
    return { message: '已关闭' };
  }

  // ==================== 补贴申请审核 ====================

  async listApplications(admin: any, dto: QuerySubsidyApplicationDto): Promise<PaginatedResult<any>> {
    const qb = this.applicationRepo.createQueryBuilder('sa')
      .leftJoin('sa.beekeeper', 'b')
      .leftJoin('sa.policy', 'p')
      .select(['sa.id', 'sa.colony_count', 'sa.apply_amount', 'sa.approved_amount', 'sa.status', 'sa.created_at',
        'b.name', 'b.phone', 'p.name']);

    if (dto.status !== undefined) qb.andWhere('sa.status = :s', { s: dto.status });
    if (dto.policyId) qb.andWhere('sa.policy_id = :p', { p: dto.policyId });
    if (dto.beekeeperKeyword) qb.andWhere('(b.name LIKE :kw OR b.phone LIKE :kw)', { kw: `%${dto.beekeeperKeyword}%` });

    qb.orderBy('sa.created_at', 'DESC');
    const [list, total] = await qb.skip(dto.skip).take(dto.pageSize).getManyAndCount();
    return paginate(list, total, dto);
  }

  async getApplicationDetail(id: number) {
    const app = await this.applicationRepo.findOne({
      where: { id },
      relations: ['beekeeper', 'policy'],
    });
    if (!app) throw new BadRequestException('申请不存在');

    // 辅助审核信息
    const actualColonies = await this.apiaryRepo
      .createQueryBuilder('a')
      .select('SUM(a.colony_count)', 'total')
      .where('a.beekeeper_id = :id AND a.status = 1', { id: app.beekeeperId })
      .getRawOne();

    return {
      ...app,
      beekeeperPhone: this.maskPhone(app.beekeeper?.phone),
      actualColonyCount: parseInt(actualColonies.total) || 0,
    };
  }

  async approveApplication(id: number, adminId: number, dto: AuditSubsidyDto) {
    await this.applicationRepo.update(id, {
      status: 2,
      approvedAmount: dto.approvedAmount,
      auditNote: dto.auditNote,
      auditedBy: adminId,
      auditedAt: new Date(),
    });
    // TODO: 微信通知蜂农
    return { message: '已通过' };
  }

  async rejectApplication(id: number, adminId: number, dto: AuditSubsidyDto) {
    await this.applicationRepo.update(id, {
      status: 3,
      auditNote: dto.auditNote,
      auditedBy: adminId,
      auditedAt: new Date(),
    });
    return { message: '已拒绝' };
  }

  async paidApplication(id: number) {
    await this.applicationRepo.update(id, {
      status: 4,
      paidAt: new Date(),
    });
    return { message: '已标记发放' };
  }

  async batchPaid(dto: BatchPaidDto) {
    if (dto.ids.length > 50) throw new BadRequestException('批量操作最多50条');
    await this.applicationRepo.update(
      { id: In(dto.ids), status: 2 },
      { status: 4, paidAt: new Date() },
    );
    return { message: `已标记 ${dto.ids.length} 条为已发放` };
  }

  async getSubsidySummary() {
    const result = await this.applicationRepo
      .createQueryBuilder('sa')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN sa.status = 0 OR sa.status = 1 THEN 1 ELSE 0 END)', 'pending')
      .addSelect('COALESCE(SUM(sa.approved_amount), 0)', 'totalApproved')
      .addSelect('COALESCE(SUM(CASE WHEN sa.status = 4 THEN sa.approved_amount ELSE 0 END)', 'totalPaid')
      .where('1=1')
      .getRawOne();

    const activePolicies = await this.policyRepo.count({ where: { status: 1 } });

    return {
      totalPolicies: await this.policyRepo.count(),
      activePolicies,
      totalApplications: parseInt(result.total) || 0,
      pendingCount: parseInt(result.pending) || 0,
      totalApprovedAmount: parseFloat(result.totalApproved) || 0,
      totalPaidAmount: parseFloat(result.totalPaid) || 0,
      unpaidAmount: (parseFloat(result.totalApproved) || 0) - (parseFloat(result.totalPaid) || 0),
    };
  }

  // ==================== 通知管理 ====================

  async createNotification(dto: CreateNotificationDto, adminId: number) {
    const isImmediate = !dto.publishTime;
    const notification = this.notificationRepo.create({
      ...dto,
      status: isImmediate ? 1 : 0,
      publishTime: isImmediate ? new Date() : new Date(dto.publishTime!),
      createdBy: adminId,
    });
    const saved = await this.notificationRepo.save(notification);

    // 立即发布时，创建蜂农通知关联记录
    if (isImmediate) {
      await this.pushNotificationToBeekeepers(saved);
    }

    return saved;
  }

  async listNotifications(dto: QueryNotificationDto): Promise<PaginatedResult<Notification>> {
    const where: any = {};
    if (dto.status !== undefined) where.status = dto.status;
    if (dto.type !== undefined) where.type = dto.type;

    const [list, total] = await this.notificationRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: dto.skip,
      take: dto.pageSize,
    });
    return paginate(list, total, dto);
  }

  async revokeNotification(id: number) {
    await this.notificationRepo.update(id, { status: 2 });
    return { message: '已撤回' };
  }

  /** 蜂农端：我的通知 */
  async listMyNotifications(beekeeperId: number, dto: PaginationDto): Promise<PaginatedResult<any>> {
    const page = Number(dto.page) || 1;
    const pageSize = Math.min(100, Math.max(1, Number(dto.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    const [rows] = await this.bkNotificationRepo.query(
      `SELECT bn.id, bn.isRead, bn.readAt,
              n.id AS notificationId, n.title, n.type, n.content, n.urgency, n.publishTime
       FROM beekeeper_notifications bn
       LEFT JOIN notifications n ON bn.notificationId = n.id
       WHERE bn.beekeeperId = ? AND n.status = 1
       ORDER BY n.publishTime DESC
       LIMIT ? OFFSET ?`,
      [beekeeperId, pageSize, offset],
    );

    const [countResult] = await this.bkNotificationRepo.query(
      `SELECT COUNT(*) AS total
       FROM beekeeper_notifications bn
       LEFT JOIN notifications n ON bn.notificationId = n.id
       WHERE bn.beekeeperId = ? AND n.status = 1`,
      [beekeeperId],
    );

    const total = Number(countResult?.total || 0);
    return paginate(rows, total, dto);
  }

  async markRead(beekeeperId: number, notificationId: number) {
    await this.bkNotificationRepo.update(
      { beekeeperId, notificationId },
      { isRead: 1, readAt: new Date() },
    );
    return { message: '已读' };
  }

  async markAllRead(beekeeperId: number) {
    await this.bkNotificationRepo.update(
      { beekeeperId, isRead: 0 },
      { isRead: 1, readAt: new Date() },
    );
    return { message: '全部已读' };
  }

  async getUnreadCount(beekeeperId: number) {
    return this.bkNotificationRepo.count({
      where: { beekeeperId, isRead: 0 },
    });
  }

  private async pushNotificationToBeekeepers(notification: Notification) {
    // 查找目标蜂农
    const where: any = { status: 1 };
    if (notification.regionCodes?.length) {
      where.regionCode = In(notification.regionCodes);
    }
    if (notification.targetTypes?.length) {
      where.level = In(notification.targetTypes);
    }

    const beekeepers = await this.beekeeperRepo.find({
      where,
      select: ['id'],
    });

    const records = beekeepers.map((b) =>
      this.bkNotificationRepo.create({
        notificationId: notification.id,
        beekeeperId: b.id,
        isRead: 0,
      }),
    );

    if (records.length > 0) {
      await this.bkNotificationRepo.save(records);
    }
    // TODO: 异步推送微信订阅消息
  }

  // ==================== 系统管理 ====================

  async listAdminUsers(dto: QueryAdminUserDto): Promise<PaginatedResult<any>> {
    const where: any = {};
    if (dto.keyword) {
      where.username = Like(`%${dto.keyword}%`);
    }
    if (dto.status !== undefined) where.status = dto.status;

    const [list, total] = await this.adminRepo.findAndCount({
      where,
      select: ['id', 'username', 'realName', 'phone', 'roleId', 'regionCode', 'status', 'lastLoginAt', 'createdAt'],
      order: { createdAt: 'DESC' },
      skip: dto.skip,
      take: dto.pageSize,
    });
    return paginate(list, total, dto);
  }

  async createAdminUser(dto: CreateAdminUserDto) {
    const existing = await this.adminRepo.findOne({ where: { username: dto.username } });
    if (existing) throw new BadRequestException('用户名已存在');

    const hashedPw = await bcrypt.hash(dto.password, 10);
    const user = this.adminRepo.create({
      ...dto,
      password: hashedPw,
      status: 1,
    });
    await this.adminRepo.save(user);
    // 密码不返回
    const { password, ...result } = user;
    return result;
  }

  async updateAdminUser(id: number, dto: Partial<CreateAdminUserDto>) {
    const user = await this.adminRepo.findOne({ where: { id } });
    if (!user) throw new BadRequestException('用户不存在');

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    // 不允许修改 username
    delete dto.username;

    Object.assign(user, dto);
    await this.adminRepo.save(user);
    return { message: '更新成功' };
  }

  async toggleAdminStatus(id: number) {
    const user = await this.adminRepo.findOne({ where: { id } });
    if (!user) throw new BadRequestException('用户不存在');
    user.status = user.status === 1 ? 0 : 1;
    await this.adminRepo.save(user);
    return { message: user.status === 1 ? '已启用' : '已停用' };
  }

  async resetAdminPassword(id: number) {
    const randomPw = `Bee${Math.random().toString(36).slice(2, 8)}!${Math.floor(Math.random() * 10)}`;
    const hashedPw = await bcrypt.hash(randomPw, 10);
    await this.adminRepo.update(id, { password: hashedPw });
    return { newPassword: randomPw };
  }

  // ==================== 数据统计 ====================

  async getOverview(admin: any) {
    const rc = admin.regionCode ? `${admin.regionCode}%` : '%';

    const bkCount = await this.beekeeperRepo.count({ where: { status: 1 } });
    const pendingCount = await this.beekeeperRepo.count({ where: { status: 0 } });
    const apiaryCount = await this.apiaryRepo.count({ where: { status: 1 } });

    const colonyResult = await this.apiaryRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.colony_count), 0)', 'total')
      .where('a.status = 1')
      .getRawOne();

    const yearStart = `${new Date().getFullYear()}-01-01`;
    const yearProdResult = await this.harvestRepo
      .createQueryBuilder('h')
      .select('COALESCE(SUM(h.quantity), 0)', 'total')
      .where('h.harvest_date >= :start', { start: yearStart })
      .getRawOne();

    const recentBeekeepers = await this.beekeeperRepo.find({
      where: { status: Not(0) },
      order: { createdAt: 'DESC' },
      take: 5,
      select: ['id', 'name', 'createdAt'],
    });

    return {
      beekeeperCount: bkCount,
      apiaryCount,
      colonyCount: parseInt(colonyResult.total) || 0,
      yearProduction: parseFloat(yearProdResult.total) || 0,
      pendingAuditCount: pendingCount,
      recentBeekeepers,
    };
  }

  // ==================== 私有方法 ====================

  private maskPhone(phone: string | null): string {
    if (!phone || phone.length < 7) return phone ?? '';
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  }

  private maskIdCard(idCard: string | null): string {
    if (!idCard || idCard.length < 7) return idCard ?? '';
    return idCard.slice(0, 4) + '********' + idCard.slice(-3);
  }
}
