import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { TraceCode } from '../entities/trace-code.entity';
import { Beekeeper } from '../entities/beekeeper.entity';
import { Apiary } from '../entities/apiary.entity';
import { HoneyHarvest } from '../entities/honey-harvest.entity';
import { Medication } from '../entities/medication.entity';
import { CreateTraceDto, QueryTraceDto } from './dto/trace.dto';
import { paginate, PaginatedResult } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class TraceService {
  constructor(
    @InjectRepository(TraceCode)
    private traceRepo: Repository<TraceCode>,
    @InjectRepository(Beekeeper)
    private beekeeperRepo: Repository<Beekeeper>,
    @InjectRepository(Apiary)
    private apiaryRepo: Repository<Apiary>,
    @InjectRepository(HoneyHarvest)
    private harvestRepo: Repository<HoneyHarvest>,
    @InjectRepository(Medication)
    private medicationRepo: Repository<Medication>,
    private config: ConfigService,
  ) {}

  /**
   * 生成溯源码
   * 格式：BEE-{beekeeperId补零6位}-{YYYYMM}-{4位流水号}
   */
  async generateCode(dto: CreateTraceDto, beekeeperId: number) {
    // 校验采蜜记录归属
    const harvest = await this.harvestRepo.findOne({
      where: { id: dto.harvestId, beekeeperId },
    });
    if (!harvest) {
      throw new BadRequestException('采蜜记录不存在或无权操作');
    }

    const now = new Date();
    const monthStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 查询当月该蜂农的最大流水号
    const prefix = `BEE-${String(beekeeperId).padStart(6, '0')}-${monthStr}`;
    const lastCode = await this.traceRepo
      .createQueryBuilder('t')
      .where('t.code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('t.code', 'DESC')
      .getOne();

    let seq = 1;
    if (lastCode) {
      const lastSeq = parseInt(lastCode.code.slice(-4), 10);
      seq = lastSeq + 1;
    }
    if (seq > 9999) {
      throw new BadRequestException('当月溯源码已达上限');
    }

    const code = `${prefix}-${String(seq).padStart(4, '0')}`;

    // 自动采集溯源链路快照
    const beekeeper = await this.beekeeperRepo.findOne({ where: { id: beekeeperId } });
    const apiary = harvest.apiaryId
      ? await this.apiaryRepo.findOne({ where: { id: harvest.apiaryId } })
      : null;

    // 关联用药记录（停药期已结束的）
    const medications = harvest.apiaryId
      ? await this.medicationRepo
          .createQueryBuilder('m')
          .where('m.apiary_id = :apiaryId AND m.withdraw_end <= :now', {
            apiaryId: harvest.apiaryId,
            now: new Date(),
          })
          .orderBy('m.med_date', 'DESC')
          .limit(5)
          .getMany()
      : [];

    const traceData = {
      beekeeper: beekeeper
        ? {
            name: beekeeper.name,
            region: `${beekeeper.province ?? ''}${beekeeper.city ?? ''}${beekeeper.district ?? ''}`,
            expYears: beekeeper.expYears,
            certNo: beekeeper.certNo,
          }
        : null,
      apiary: apiary
        ? {
            name: apiary.name,
            address: apiary.address,
            beeBreed: apiary.beeBreed,
            longitude: apiary.longitude,
            latitude: apiary.latitude,
          }
        : null,
      harvest: {
        date: harvest.harvestDate,
        honeyType: harvest.honeyType,
        quantity: harvest.quantity,
        baumeDegree: harvest.baumeDegree,
        qualityGrade: harvest.qualityGrade,
      },
      medications: medications.map((m) => ({
        date: m.medDate,
        drugName: m.drugName,
        diseaseName: m.diseaseName,
        withdrawEnd: m.withdrawEnd,
      })),
      process: dto.processNotes || null,
      quality: dto.qualityInfo || null,
      generatedAt: new Date().toISOString(),
    };

    const traceCode = this.traceRepo.create({
      code,
      beekeeperId,
      apiaryId: harvest.apiaryId || undefined,
      harvestId: dto.harvestId,
      productName: dto.productName,
      batchNo: dto.batchNo,
      spec: dto.spec,
      produceDate: new Date(dto.produceDate),
      shelfLifeMonths: dto.shelfLifeMonths,
      traceData,
      status: 1,
    } as Partial<TraceCode>);

    await this.traceRepo.save(traceCode);

    // 生成二维码内容URL
    const domain = this.config.get<string>('APP_DOMAIN', 'https://bee.example.com');
    const qrUrl = `${domain}/trace/${code}`;

    return {
      code,
      qrUrl,
      traceCode,
    };
  }

  /**
   * 获取我的溯源码列表
   */
  async listMyCodes(beekeeperId: number, dto: QueryTraceDto): Promise<PaginatedResult<TraceCode>> {
    const [list, total] = await this.traceRepo.findAndCount({
      where: { beekeeperId },
      order: { createdAt: 'DESC' },
      skip: dto.skip,
      take: dto.pageSize,
    });
    return paginate(list, total, dto);
  }

  /**
   * 获取溯源码详情
   */
  async getTraceDetail(id: number, beekeeperId: number) {
    const traceCode = await this.traceRepo.findOne({
      where: { id, beekeeperId },
    });
    if (!traceCode) {
      throw new BadRequestException('溯源码不存在');
    }

    const domain = this.config.get<string>('APP_DOMAIN', 'https://bee.example.com');
    return {
      ...traceCode,
      qrUrl: `${domain}/trace/${traceCode.code}`,
    };
  }

  /**
   * 溯源公开查询（无需登录）
   */
  async queryByCode(code: string) {
    const traceCode = await this.traceRepo.findOne({
      where: { code },
    });

    if (!traceCode) {
      return { valid: false, reason: 'not_found' };
    }

    if (traceCode.status === 0) {
      return { valid: false, reason: 'recalled' };
    }

    // 扫码计数 +1
    traceCode.scanCount = (traceCode.scanCount || 0) + 1;
    await this.traceRepo.save(traceCode);

    // 高频扫码警告
    const warning =
      traceCode.scanCount > 50 && traceCode.scanCount <= 200
        ? 'high_scan_count'
        : null;

    return {
      valid: true,
      warning,
      data: {
        code: traceCode.code,
        productName: traceCode.productName,
        spec: traceCode.spec,
        batchNo: traceCode.batchNo,
        produceDate: traceCode.produceDate,
        shelfLifeMonths: traceCode.shelfLifeMonths,
        scanCount: traceCode.scanCount,
        traceData: traceCode.traceData,
      },
    };
  }
}
