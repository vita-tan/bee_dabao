import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Apiary } from '../entities/apiary.entity';
import { Hive } from '../entities/hive.entity';
import { Inspection } from '../entities/inspection.entity';
import { HoneyHarvest } from '../entities/honey-harvest.entity';
import { Medication } from '../entities/medication.entity';
import {
  CreateApiaryDto,
  UpdateApiaryDto,
  CreateHiveDto,
  BatchCreateHiveDto,
  UpdateHiveDto,
} from './dto/apiary.dto';

@Injectable()
export class ApiaryService {
  constructor(
    @InjectRepository(Apiary)
    private apiaryRepo: Repository<Apiary>,
    @InjectRepository(Hive)
    private hiveRepo: Repository<Hive>,
    private dataSource: DataSource,
  ) {}

  // ==================== 蜂场 CRUD ====================

  /** 获取蜂农的所有蜂场 */
  async listApiaries(beekeeperId: number) {
    const apiaries = await this.apiaryRepo.find({
      where: { beekeeperId, status: 1 },
      order: { createdAt: 'DESC' },
    });

    // 附加最后巡查距今天数
    const now = new Date();
    return apiaries.map((a) => {
      const lastInspect = a.lastInspectAt
        ? Math.floor((now.getTime() - new Date(a.lastInspectAt).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      return { ...a, daysSinceLastInspect: lastInspect };
    });
  }

  /** 获取蜂场详情（含蜂箱列表） */
  async getApiaryDetail(id: number, beekeeperId: number) {
    const apiary = await this.apiaryRepo.findOne({
      where: { id, beekeeperId },
    });
    if (!apiary) {
      throw new BadRequestException('蜂场不存在');
    }

    const hives = await this.hiveRepo.find({
      where: { apiaryId: id, status: 1 },
      order: { hiveNo: 'ASC' },
    });

    return { ...apiary, hives };
  }

  /** 创建蜂场 */
  async createApiary(dto: CreateApiaryDto, beekeeperId: number) {
    // 限制最多 20 个蜂场
    const count = await this.apiaryRepo.count({
      where: { beekeeperId },
    });
    if (count >= 20) {
      throw new BadRequestException('蜂场数量已达上限（20个）');
    }

    const apiary = this.apiaryRepo.create({
      name: dto.name,
      address: dto.address,
      longitude: dto.longitude,
      latitude: dto.latitude,
      altitude: dto.altitude,
      beeBreed: dto.beeBreed,
      boxCount: dto.boxCount,
      colonyCount: dto.colonyCount,
      honeySource: dto.honeySource,
      photos: dto.photos,
      isSeasonal: dto.isSeasonal ? 1 : 0,
      province: dto.province,
      city: dto.city,
      district: dto.district,
      town: dto.town,
      regionCode: dto.regionCode,
      beekeeperId,
      status: 1,
    } as Partial<Apiary>);
    return this.apiaryRepo.save(apiary);
  }

  /** 编辑蜂场 */
  async updateApiary(id: number, dto: UpdateApiaryDto, beekeeperId: number) {
    const apiary = await this.apiaryRepo.findOne({
      where: { id, beekeeperId },
    });
    if (!apiary) {
      throw new BadRequestException('蜂场不存在');
    }

    Object.assign(apiary, dto);
    return this.apiaryRepo.save(apiary);
  }

  /** 删除蜂场（软删除） */
  async deleteApiary(id: number, beekeeperId: number) {
    const apiary = await this.apiaryRepo.findOne({
      where: { id, beekeeperId },
    });
    if (!apiary) {
      throw new BadRequestException('蜂场不存在');
    }

    // 检查是否有关联的生产记录
    const hasInspections = await this.dataSource
      .getRepository(Inspection)
      .count({ where: { apiaryId: id } });
    const hasHarvests = await this.dataSource
      .getRepository(HoneyHarvest)
      .count({ where: { apiaryId: id } });
    const hasMedications = await this.dataSource
      .getRepository(Medication)
      .count({ where: { apiaryId: id } });

    if (hasInspections || hasHarvests || hasMedications) {
      throw new BadRequestException(
        '该蜂场下存在生产记录，禁止删除',
      );
    }

    // 软删除
    apiary.status = 0;
    await this.apiaryRepo.save(apiary);
    return { message: '删除成功' };
  }

  // ==================== 蜂箱 CRUD ====================

  /** 获取蜂场下所有蜂箱 */
  async listHives(apiaryId: number, beekeeperId: number) {
    // 校验蜂场归属
    const apiary = await this.apiaryRepo.findOne({
      where: { id: apiaryId, beekeeperId },
    });
    if (!apiary) {
      throw new ForbiddenException('无权访问该蜂场');
    }

    return this.hiveRepo.find({
      where: { apiaryId, status: 1 },
      order: { hiveNo: 'ASC' },
    });
  }

  /** 创建单个蜂箱 */
  async createHive(
    apiaryId: number,
    beekeeperId: number,
    dto: CreateHiveDto,
  ) {
    await this.validateApiaryOwner(apiaryId, beekeeperId);

    // 检查蜂箱编号唯一性
    const existing = await this.hiveRepo.findOne({
      where: { apiaryId, hiveNo: dto.hiveNo },
    });
    if (existing) {
      throw new BadRequestException(`蜂箱编号 ${dto.hiveNo} 已存在`);
    }

    const hive = this.hiveRepo.create({
      apiaryId,
      hiveNo: dto.hiveNo,
      beeBreed: dto.beeBreed,
      introDate: dto.hiveDate ? new Date(dto.hiveDate) : undefined,
      notes: dto.notes,
      status: 1,
    } as Partial<Hive>);
    return this.hiveRepo.save(hive);
  }

  /** 批量创建蜂箱 */
  async batchCreateHives(
    apiaryId: number,
    beekeeperId: number,
    dto: BatchCreateHiveDto,
  ) {
    await this.validateApiaryOwner(apiaryId, beekeeperId);

    if (dto.count < 1 || dto.count > 100) {
      throw new BadRequestException('批量创建数量范围：1-100');
    }

    // 解析起始编号
    const match = dto.startNo.match(/^([A-Za-z]*)(\d+)$/);
    if (!match) {
      throw new BadRequestException('起始编号格式错误，如 A01');
    }

    const prefix = match[1];
    const startNum = parseInt(match[2], 10);
    const numDigits = match[2].length;

    const hives: Hive[] = [];
    for (let i = 0; i < dto.count; i++) {
      const hiveNo = `${prefix}${String(startNum + i).padStart(numDigits, '0')}`;

      // 检查编号唯一性
      const existing = await this.hiveRepo.findOne({
        where: { apiaryId, hiveNo },
      });
      if (existing) {
        throw new BadRequestException(`蜂箱编号 ${hiveNo} 已存在`);
      }

      hives.push(
        this.hiveRepo.create({
          apiaryId,
          hiveNo,
          beeBreed: dto.beeBreed,
          status: 1,
        }),
      );
    }

    await this.hiveRepo.save(hives);
    return { created: hives.length, hiveNos: hives.map((h) => h.hiveNo) };
  }

  /** 编辑蜂箱 */
  async updateHive(id: number, beekeeperId: number, dto: UpdateHiveDto) {
    const hive = await this.hiveRepo.findOne({
      where: { id },
      relations: ['apiary'],
    });
    if (!hive || hive.apiary.beekeeperId !== beekeeperId) {
      throw new ForbiddenException('无权操作该蜂箱');
    }

    Object.assign(hive, dto);
    return this.hiveRepo.save(hive);
  }

  /** 校验蜂场归属 */
  private async validateApiaryOwner(
    apiaryId: number,
    beekeeperId: number,
  ) {
    const apiary = await this.apiaryRepo.findOne({
      where: { id: apiaryId, beekeeperId },
    });
    if (!apiary) {
      throw new ForbiddenException('无权访问该蜂场');
    }
  }
}
