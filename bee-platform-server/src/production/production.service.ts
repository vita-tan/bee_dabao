import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, MoreThan, Between } from 'typeorm';
import { Apiary } from '../entities/apiary.entity';
import { Hive } from '../entities/hive.entity';
import { Inspection } from '../entities/inspection.entity';
import { HoneyHarvest } from '../entities/honey-harvest.entity';
import { Medication } from '../entities/medication.entity';
import { Account } from '../entities/account.entity';
import {
  CreateInspectionDto,
  QueryInspectionDto,
  CreateHarvestDto,
  QueryHarvestDto,
  CreateMedicationDto,
  QueryMedicationDto,
  CreateAccountDto,
  QueryAccountDto,
} from './dto/production.dto';
import { paginate, PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepo: Repository<Inspection>,
    @InjectRepository(HoneyHarvest)
    private harvestRepo: Repository<HoneyHarvest>,
    @InjectRepository(Medication)
    private medicationRepo: Repository<Medication>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(Apiary)
    private apiaryRepo: Repository<Apiary>,
    @InjectRepository(Hive)
    private hiveRepo: Repository<Hive>,
    private dataSource: DataSource,
  ) {}

  // ==================== 巡查记录 ====================

  async createInspection(dto: CreateInspectionDto, beekeeperId: number) {
    await this.validateApiaryOwner(dto.apiaryId, beekeeperId);

    // 异常时备注必填
    if (dto.overallHealth === 4 && !dto.notes) {
      throw new BadRequestException('健康状态为异常时，备注为必填项');
    }

    // 不允许未来日期
    if (new Date(dto.inspectDate) > new Date()) {
      throw new BadRequestException('巡查日期不能是未来日期');
    }

    const record = this.inspectionRepo.create({
      ...dto,
      inspectDate: new Date(dto.inspectDate),
      beekeeperId,
      hiveCount: dto.hiveIds.length,
    });
    await this.inspectionRepo.save(record);

    // 更新蜂场最后巡查时间
    await this.apiaryRepo.update(dto.apiaryId, {
      lastInspectAt: new Date(dto.inspectDate),
    });

    return record;
  }

  async listInspections(
    beekeeperId: number,
    dto: QueryInspectionDto,
  ): Promise<PaginatedResult<Inspection>> {
    const where: any = { beekeeperId };
    if (dto.apiaryId) where.apiaryId = dto.apiaryId;

    const [list, total] = await this.inspectionRepo.findAndCount({
      where,
      order: { inspectDate: 'DESC' },
      skip: dto.skip,
      take: dto.pageSize,
    });
    return paginate(list, total, dto);
  }

  async getInspection(id: number, beekeeperId: number) {
    const record = await this.inspectionRepo.findOne({
      where: { id, beekeeperId },
    });
    if (!record) throw new BadRequestException('记录不存在');
    return record;
  }

  // ==================== 采蜜记录 ====================

  async createHarvest(dto: CreateHarvestDto, beekeeperId: number) {
    await this.validateApiaryOwner(dto.apiaryId, beekeeperId);

    // 校验蜂箱停药期
    if (dto.hiveIds && dto.hiveIds.length > 0) {
      const hives = await this.hiveRepo.find({
        where: dto.hiveIds.map((id) => ({ id })),
      });
      const withdrawHives = hives.filter(
        (h) => h.inWithdraw === 1 && h.withdrawEnd && new Date(h.withdrawEnd) > new Date(),
      );
      if (withdrawHives.length > 0) {
        throw new BadRequestException(
          `存在停药期未结束的蜂箱：${withdrawHives.map((h) => h.hiveNo).join('、')}，禁止采蜜`,
        );
      }
    }

    // 自动判断品质等级
    let qualityGrade = 2;
    if (dto.baumeDegree !== undefined && dto.baumeDegree >= 41) {
      qualityGrade = 1;
    }

    const record = this.harvestRepo.create({
      ...dto,
      harvestDate: new Date(dto.harvestDate),
      beekeeperId,
      qualityGrade,
    });
    return this.harvestRepo.save(record);
  }

  async listHarvests(
    beekeeperId: number,
    dto: QueryHarvestDto,
  ): Promise<PaginatedResult<HoneyHarvest>> {
    const where: any = { beekeeperId };
    if (dto.apiaryId) where.apiaryId = dto.apiaryId;

    const [list, total] = await this.harvestRepo.findAndCount({
      where,
      order: { harvestDate: 'DESC' },
      skip: dto.skip,
      take: dto.pageSize,
    });
    return paginate(list, total, dto);
  }

  async getHarvest(id: number, beekeeperId: number) {
    const record = await this.harvestRepo.findOne({
      where: { id, beekeeperId },
    });
    if (!record) throw new BadRequestException('记录不存在');
    return record;
  }

  /** 库存汇总 */
  async getInventory(beekeeperId: number) {
    // 采蜜总量（按蜜种分组）
    const harvestResult = await this.harvestRepo
      .createQueryBuilder('h')
      .select('h.honey_type', 'honeyType')
      .addSelect('SUM(h.quantity)', 'totalHarvest')
      .where('h.beekeeperId = :id', { id: beekeeperId })
      .groupBy('h.honeyType')
      .getRawMany();

    // 这里简化处理：库存 = 采蜜总量（实际应减去销售记录中的蜂蜜销售）
    // 收支记录中 type=1(收入) category 含蜂蜜销售 的可以视为出库
    const salesResult = await this.accountRepo
      .createQueryBuilder('a')
      .select('a.category', 'category')
      .addSelect('SUM(a.amount)', 'totalSales')
      .where('a.beekeeperId = :id AND a.type = 1 AND a.category LIKE :kw', {
        id: beekeeperId,
        kw: '%蜂蜜销售%',
      })
      .groupBy('a.category')
      .getRawMany();

    // 简化：返回每种蜜的入库量
    return harvestResult.map((h) => ({
      honeyType: h.honeyType,
      totalHarvest: parseFloat(h.totalHarvest) || 0,
    }));
  }

  // ==================== 用药记录 ====================

  async createMedication(dto: CreateMedicationDto, beekeeperId: number) {
    await this.validateApiaryOwner(dto.apiaryId, beekeeperId);

    const medDate = new Date(dto.medDate);
    // 计算停药截止日期
    const withdrawEnd = new Date(medDate);
    withdrawEnd.setDate(withdrawEnd.getDate() + dto.withdrawDays);

    const record = this.medicationRepo.create({
      ...dto,
      medDate,
      withdrawEnd,
      beekeeperId,
    });
    await this.medicationRepo.save(record);

    // 批量更新蜂箱停药状态
    await this.hiveRepo.update(
      { id: dto.hiveIds as any },
      { inWithdraw: 1, withdrawEnd },
    );

    return { ...record, withdrawEnd };
  }

  async listMedications(
    beekeeperId: number,
    dto: QueryMedicationDto,
  ): Promise<PaginatedResult<Medication>> {
    const where: any = { beekeeperId };
    if (dto.apiaryId) where.apiaryId = dto.apiaryId;

    const [list, total] = await this.medicationRepo.findAndCount({
      where,
      order: { medDate: 'DESC' },
      skip: dto.skip,
      take: dto.pageSize,
    });
    return paginate(list, total, dto);
  }

  async getMedication(id: number, beekeeperId: number) {
    const record = await this.medicationRepo.findOne({
      where: { id, beekeeperId },
    });
    if (!record) throw new BadRequestException('记录不存在');
    return record;
  }

  // ==================== 收支记录 ====================

  async createAccount(dto: CreateAccountDto, beekeeperId: number) {
    const record = this.accountRepo.create({
      ...dto,
      recordDate: new Date(dto.recordDate),
      beekeeperId,
    });
    return this.accountRepo.save(record);
  }

  async listAccounts(
    beekeeperId: number,
    dto: QueryAccountDto,
  ): Promise<PaginatedResult<Account>> {
    const where: any = { beekeeperId };
    if (dto.type) where.type = dto.type;

    const [list, total] = await this.accountRepo.findAndCount({
      where,
      order: { recordDate: 'DESC' },
      skip: dto.skip,
      take: dto.pageSize,
    });
    return paginate(list, total, dto);
  }

  /** 收支统计摘要 */
  async getAccountSummary(beekeeperId: number) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // 本月收入
    const monthIncome = await this.accountRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amount), 0)', 'total')
      .where('a.beekeeperId = :id AND a.type = 1 AND a.recordDate >= :start', {
        id: beekeeperId,
        start: monthStart,
      })
      .getRawOne();

    // 本月支出
    const monthExpense = await this.accountRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amount), 0)', 'total')
      .where('a.beekeeperId = :id AND a.type = 2 AND a.recordDate >= :start', {
        id: beekeeperId,
        start: monthStart,
      })
      .getRawOne();

    // 本年收入
    const yearIncome = await this.accountRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amount), 0)', 'total')
      .where('a.beekeeperId = :id AND a.type = 1 AND a.recordDate >= :start', {
        id: beekeeperId,
        start: yearStart,
      })
      .getRawOne();

    // 本年支出
    const yearExpense = await this.accountRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amount), 0)', 'total')
      .where('a.beekeeperId = :id AND a.type = 2 AND a.recordDate >= :start', {
        id: beekeeperId,
        start: yearStart,
      })
      .getRawOne();

    const mi = parseFloat(monthIncome?.total) || 0;
    const me = parseFloat(monthExpense?.total) || 0;
    const yi = parseFloat(yearIncome?.total) || 0;
    const ye = parseFloat(yearExpense?.total) || 0;

    // 近6月趋势
    const trend = await this.accountRepo
      .createQueryBuilder('a')
      .select("DATE_FORMAT(a.recordDate, '%Y-%m')", 'month')
      .addSelect("SUM(CASE WHEN a.type = 1 THEN a.amount ELSE 0 END)", 'income')
      .addSelect("SUM(CASE WHEN a.type = 2 THEN a.amount ELSE 0 END)", 'expense')
      .where('a.beekeeperId = :id AND a.recordDate >= :start', {
        id: beekeeperId,
        start: new Date(now.getFullYear(), now.getMonth() - 5, 1),
      })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      monthIncome: mi,
      monthExpense: me,
      monthProfit: mi - me,
      yearIncome: yi,
      yearExpense: ye,
      monthTrend: trend.map((t) => ({
        month: t.month,
        income: parseFloat(t.income) || 0,
        expense: parseFloat(t.expense) || 0,
      })),
    };
  }

  /** 校验蜂场归属 */
  private async validateApiaryOwner(apiaryId: number, beekeeperId: number) {
    const apiary = await this.apiaryRepo.findOne({
      where: { id: apiaryId, beekeeperId },
    });
    if (!apiary) {
      throw new ForbiddenException('无权访问该蜂场');
    }
  }
}
