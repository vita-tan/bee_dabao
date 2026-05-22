/**
 * 种子数据脚本 - 生成测试账号和测试数据
 *
 * 使用方式: npx ts-node src/seed.ts
 * 或者:    node dist/seed.js
 *
 * 角色约定 (roleId):
 *   1 = 超级管理员
 *   2 = 县级管理员
 *   3 = 乡镇管理员
 *   4 = 普通操作员
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载 .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { Beekeeper } from './entities/beekeeper.entity';
import { Apiary } from './entities/apiary.entity';
import { Hive } from './entities/hive.entity';
import { Inspection } from './entities/inspection.entity';
import { HoneyHarvest } from './entities/honey-harvest.entity';
import { Medication } from './entities/medication.entity';
import { TraceCode } from './entities/trace-code.entity';
import { SubsidyPolicy } from './entities/subsidy-policy.entity';
import { SubsidyApplication } from './entities/subsidy-application.entity';
import { Notification } from './entities/notification.entity';
import { BeekeeperNotification } from './entities/beekeeper-notification.entity';
import { Account } from './entities/account.entity';

// ============================================================
// 配置
// ============================================================
const BCRYPT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'Bee123456'; // 所有测试账号统一密码

// 南浦溪镇坐标
const NPX_LNG = 119.72;
const NPX_LAT = 27.47;

// ============================================================
// 测试数据定义
// ============================================================

/** 管理员测试账号 */
const adminSeed: Partial<Admin>[] = [
  {
    username: 'superadmin',
    realName: '超级管理员',
    phone: '13900000001',
    roleId: 1,
    regionCode: '330329',
    status: 1,
  },
  {
    username: 'taishun_admin',
    realName: '泰顺县管理员',
    phone: '13900000002',
    roleId: 2,
    regionCode: '330329',
    status: 1,
  },
  {
    username: 'npx_admin',
    realName: '南浦溪镇管理员',
    phone: '13900000003',
    roleId: 3,
    regionCode: '330329',
    status: 1,
  },
  {
    username: 'operator01',
    realName: '操作员张三',
    phone: '13900000004',
    roleId: 4,
    regionCode: '330329',
    status: 1,
  },
  {
    username: 'operator02',
    realName: '操作员李四',
    phone: '13900000005',
    roleId: 4,
    regionCode: '330329',
    status: 1,
  },
];

/** 蜂农测试账号 (已审核通过 status=1) */
const beekeeperSeed: Partial<Beekeeper>[] = [
  {
    openid: 'dev_openid_bk001',
    phone: '13800010001',
    name: '陈大明',
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '南浦溪镇',
    address: '南浦溪镇库村',
    expYears: 15,
    beeBreed: '中华蜜蜂（中蜂）',
    certNo: 'ZJ-TS-2024-001',
    level: 2, // 专业
    creditScore: 92,
    status: 1, // 正常
    auditedAt: new Date('2025-12-01'),
    auditedBy: 1,
  },
  {
    openid: 'dev_openid_bk002',
    phone: '13800010002',
    name: '王秀英',
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '南浦溪镇',
    address: '南浦溪镇双坑口村',
    expYears: 8,
    beeBreed: '意大利蜂（意蜂）',
    certNo: 'ZJ-TS-2024-002',
    level: 2, // 专业
    creditScore: 88,
    status: 1,
    auditedAt: new Date('2025-12-05'),
    auditedBy: 1,
  },
  {
    openid: 'dev_openid_bk003',
    phone: '13800010003',
    name: '刘建国',
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '南浦溪镇',
    address: '南浦溪镇周新村',
    expYears: 20,
    beeBreed: '中华蜜蜂（中蜂）',
    certNo: 'ZJ-TS-2023-015',
    level: 3, // 企业
    creditScore: 95,
    status: 1,
    auditedAt: new Date('2025-11-20'),
    auditedBy: 1,
  },
  {
    openid: 'dev_openid_bk004',
    phone: '13800010004',
    name: '张小芳',
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '南浦溪镇',
    address: '南浦溪镇包坑村',
    expYears: 3,
    beeBreed: '中华蜜蜂（中蜂）',
    level: 1, // 散户
    creditScore: 82,
    status: 1,
    auditedAt: new Date('2026-01-10'),
    auditedBy: 2,
  },
  {
    openid: 'dev_openid_bk005',
    phone: '13800010005',
    name: '吴根生',
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '泗溪镇',
    address: '泗溪镇下桥村',
    expYears: 12,
    beeBreed: '意大利蜂（意蜂）',
    certNo: 'ZJ-TS-2024-008',
    level: 2, // 专业
    creditScore: 85,
    status: 1,
    auditedAt: new Date('2026-01-15'),
    auditedBy: 2,
  },
  {
    openid: 'dev_openid_bk006',
    phone: '13800010006',
    name: '赵来弟',
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '罗阳镇',
    address: '罗阳镇城北社区',
    expYears: 5,
    beeBreed: '中华蜜蜂（中蜂）',
    level: 1, // 散户
    creditScore: 78,
    status: 0, // 待审核
  },
  {
    openid: 'dev_openid_bk007',
    phone: '13800010007',
    name: '林阿福',
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '司前镇',
    address: '司前镇左溪村',
    expYears: 1,
    beeBreed: '中华蜜蜂（中蜂）',
    level: 1,
    creditScore: 75,
    status: 0, // 待审核
  },
  {
    openid: 'dev_openid_bk008',
    phone: '13800010008',
    name: '郑美华',
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '南浦溪镇',
    address: '南浦溪镇新仓村',
    expYears: 10,
    beeBreed: '意大利蜂（意蜂）',
    certNo: 'ZJ-TS-2024-012',
    level: 2,
    creditScore: 60,
    status: 2, // 冻结
    auditNote: '多次提交虚假材料',
  },
];

/** 蜂场数据 */
const apiarySeed: (bkId: number, index: number) => Partial<Apiary>[] = (bkId, idx) => {
  const positions = [
    { lng: 119.71, lat: 27.48, alt: 520 },
    { lng: 119.73, lat: 27.50, alt: 480 },
    { lng: 119.69, lat: 27.46, alt: 610 },
    { lng: 119.75, lat: 27.45, alt: 550 },
    { lng: 119.68, lat: 27.49, alt: 490 },
    { lng: 119.74, lat: 27.52, alt: 530 },
    { lng: 119.70, lat: 27.44, alt: 600 },
    { lng: 119.76, lat: 27.47, alt: 470 },
    { lng: 119.67, lat: 27.51, alt: 560 },
    { lng: 119.72, lat: 27.53, alt: 500 },
    { lng: 119.69, lat: 27.43, alt: 580 },
    { lng: 119.77, lat: 27.49, alt: 510 },
    { lng: 119.66, lat: 27.47, alt: 630 },
    { lng: 119.73, lat: 27.44, alt: 450 },
    { lng: 119.71, lat: 27.52, alt: 540 },
  ];
  const names = [
    '库村山头蜂场', '双坑沟谷蜂场', '周新岭背蜂场', '包坑溪边蜂场',
    '新仓后山蜂场', '南浦溪源蜂场', '朝头垟蜂场', '培坑山顶蜂场',
    '龙前田畔蜂场', '箬垟林间蜂场', '孙坪蜜源蜂场', '黄坛底蜂场',
    '坑底溪畔蜂场', '翁山云雾蜂场', '秀涧山腰蜂场',
  ];
  const sources = [
    '百花蜜源', '乌桕+野桂花', '桉树+荆条', '油菜花+刺槐',
    '野山花', '荔枝+龙眼', '鸭脚木+柃木', '五味子+野菊花',
  ];
  const breeds = ['中华蜜蜂（中蜂）', '意大利蜂（意蜂）'];
  const pos = positions[idx % positions.length];
  return [{
    beekeeperId: bkId,
    name: names[idx % names.length],
    regionCode: '330329',
    province: '浙江省',
    city: '温州市',
    district: '泰顺县',
    town: '南浦溪镇',
    address: `南浦溪镇${names[idx % names.length]}`,
    longitude: pos.lng + (Math.random() - 0.5) * 0.02,
    latitude: pos.lat + (Math.random() - 0.5) * 0.02,
    altitude: pos.alt + Math.floor((Math.random() - 0.5) * 100),
    beeBreed: breeds[idx % 2],
    boxCount: 20 + Math.floor(Math.random() * 80),
    colonyCount: 15 + Math.floor(Math.random() * 60),
    honeySource: sources[idx % sources.length],
    isSeasonal: idx % 5 === 0 ? 1 : 0,
    status: 1,
  }];
};

/** 巡检记录数据 */
const inspectionSeed: (apiaryId: number, bkId: number) => Partial<Inspection>[] = (apiaryId, bkId) => {
  const types = [1, 2, 3, 4]; // 日常、繁殖期、病害排查、转场前
  const healths = [1, 2, 3];
  const records: Partial<Inspection>[] = [];
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 12 + Math.floor(Math.random() * 7)));
    records.push({
      apiaryId,
      beekeeperId: bkId,
      inspectDate: date,
      inspectType: types[i % types.length],
      hiveCount: 10 + Math.floor(Math.random() * 30),
      overallHealth: healths[i % healths.length],
      queenStatus: i % 4 === 0 ? 2 : 1, // 偶尔异常
      broodStatus: (i % 3) + 1,
      honeyStorage: (i % 3) + 1,
      notes: i % 2 === 0 ? '蜂群状态良好，蜜源充足' : '部分蜂箱需要补充饲料',
    });
  }
  return records;
};

/** 蜂蜜采收记录 */
const harvestSeed: (apiaryId: number, bkId: number) => Partial<HoneyHarvest>[] = (apiaryId, bkId) => {
  const types = ['百花蜜', '冬蜜', '土蜂蜜', '桉树蜜', '野桂花蜜', '乌桕蜜'];
  const records: Partial<HoneyHarvest>[] = [];
  const now = new Date();

  for (let i = 0; i < 4; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 30 + Math.floor(Math.random() * 15)));
    records.push({
      apiaryId,
      beekeeperId: bkId,
      harvestDate: date,
      honeyType: types[i % types.length],
      quantity: 5 + Math.floor(Math.random() * 45),
      baumeDegree: 40 + Math.random() * 4,
      qualityGrade: i % 3 === 0 ? 1 : 2,
      method: i % 2 === 0 ? 1 : 2,
      notes: i % 3 === 0 ? '成熟蜜，品质优良' : '',
    });
  }
  return records;
};

/** 用药记录 */
const medSeed: (apiaryId: number, bkId: number) => Partial<Medication>[] = (apiaryId, bkId) => {
  const diseases = ['螨虫病', '欧洲幼虫腐臭病', '中蜂囊状幼虫病', '美洲幼虫腐臭病'];
  const drugs = ['甲酸（蚁酸）', '草酸', '麝香草酚', '氟氯苯氰菊酯'];
  const methods = [1, 2, 3, 4];
  const records: Partial<Medication>[] = [];
  const now = new Date();

  for (let i = 0; i < 3; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 45 + Math.floor(Math.random() * 20)));
    const withdrawDays = [7, 14, 21, 30][i % 4];
    const withdrawEnd = new Date(date);
    withdrawEnd.setDate(withdrawEnd.getDate() + withdrawDays);
    records.push({
      apiaryId,
      beekeeperId: bkId,
      hiveIds: [1, 2, 3], // 关联蜂箱ID
      medDate: date,
      diseaseName: diseases[i % diseases.length],
      drugName: drugs[i % drugs.length],
      dosage: `每次${(i + 1) * 5}ml，连续${3 + i}天`,
      medMethod: methods[i % methods.length],
      withdrawDays,
      withdrawEnd,
      operator: '蜂农自行操作',
      notes: i % 2 === 0 ? '用药后蜂群状态明显改善' : '需持续观察',
    });
  }
  return records;
};

/** 收支账目数据 */
const accountSeed: (bkId: number) => Partial<Account>[] = (bkId) => {
  const incomeCategories = ['蜂蜜销售', '蜂王浆销售', '蜂花粉销售', '蜂蜡销售', '蜂群出售'];
  const expenseCategories = ['饲料成本', '药物费用', '蜂具采购', '运输费用', '场地租赁'];
  const records: Partial<Account>[] = [];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 15 + Math.floor(Math.random() * 10)));
    const isIncome = i % 2 === 0;
    records.push({
      beekeeperId: bkId,
      type: isIncome ? 1 : 2,
      amount: isIncome
        ? 500 + Math.floor(Math.random() * 5000)
        : 100 + Math.floor(Math.random() * 2000),
      category: isIncome
        ? incomeCategories[i % incomeCategories.length]
        : expenseCategories[i % expenseCategories.length],
      recordDate: date,
      notes: isIncome ? '零售+批发' : '定期采购',
    });
  }
  return records;
};

// ============================================================
// 主执行逻辑
// ============================================================

async function seed() {
  console.log('🌱 开始生成种子数据...\n');

  // 连接数据库
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'bee_platform',
    charset: 'utf8mb4',
    timezone: '+08:00',
    entities: [
      Admin, Beekeeper, Apiary, Hive, Inspection,
      HoneyHarvest, Medication, TraceCode, SubsidyPolicy,
      SubsidyApplication, Notification, BeekeeperNotification, Account,
    ],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('✅ 数据库连接成功\n');

  const hashedPw = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  // ─── 1. 管理员 ───
  console.log('📋 创建管理员账号...');
  const adminRepo = dataSource.getRepository(Admin);
  const admins: Admin[] = [];
  for (const a of adminSeed) {
    const existing = await adminRepo.findOne({ where: { username: a.username! } });
    if (existing) {
      console.log(`   ⏭️  ${a.username} 已存在，跳过`);
      admins.push(existing);
      continue;
    }
    const admin = adminRepo.create({ ...a, password: hashedPw });
    const saved = await adminRepo.save(admin);
    admins.push(saved);
    console.log(`   ✅ ${a.username} (${a.realName ?? ''}) roleId=${a.roleId}`);
  }
  console.log('');

  // ─── 2. 蜂农 ───
  console.log('🐝 创建蜂农账号...');
  const bkRepo = dataSource.getRepository(Beekeeper);
  const beekeepers: Beekeeper[] = [];
  for (const b of beekeeperSeed) {
    const existing = await bkRepo.findOne({ where: { openid: b.openid! } });
    if (existing) {
      console.log(`   ⏭️  ${b.name} 已存在，跳过`);
      beekeepers.push(existing);
      continue;
    }
    const bk = bkRepo.create(b as Beekeeper);
    const saved = await bkRepo.save(bk);
    beekeepers.push(saved);
    const statusText = ['待审核', '正常', '冻结', '拒绝'][b.status as number] || '';
    console.log(`   ✅ ${b.name} (${b.phone}) [${statusText}]`);
  }
  console.log('');

  // ─── 3. 蜂场 ───
  console.log('🏠 创建蜂场...');
  const apiaryRepo = dataSource.getRepository(Apiary);
  const apiaries: Apiary[] = [];
  let apiaryIdx = 0;
  for (const bk of beekeepers) {
    if (bk.status !== 1) continue; // 只给已审核通过的蜂农创建蜂场
    const count = 1 + Math.floor(Math.random() * 2); // 1-2个蜂场
    for (let i = 0; i < count; i++) {
      const data = apiarySeed(bk.id, apiaryIdx)[0];
      const apiary = apiaryRepo.create(data as Apiary);
      const saved = await apiaryRepo.save(apiary);
      apiaries.push(saved);
      console.log(`   ✅ ${data.name} → ${bk.name} (蜂群${data.colonyCount}群)`);
      apiaryIdx++;
    }
  }
  console.log('');

  // ─── 4. 蜂箱 ───
  console.log('📦 创建蜂箱...');
  const hiveRepo = dataSource.getRepository(Hive);
  let hiveCount = 0;
  for (const apiary of apiaries) {
    const boxNum = apiary.boxCount || 20;
    for (let i = 0; i < Math.min(boxNum, 15); i++) { // 每个蜂场最多15箱
      const hiveNo = `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`;
      const existing = await hiveRepo.findOne({ where: { apiaryId: apiary.id, hiveNo } });
      if (existing) continue;
      const hive = hiveRepo.create({
        apiaryId: apiary.id,
        hiveNo,
        beeBreed: apiary.beeBreed,
        introDate: new Date('2024-03-15'),
        health: Math.random() > 0.2 ? 1 : 2,
        queenStatus: Math.random() > 0.9 ? 2 : 1,
        inWithdraw: Math.random() > 0.85 ? 1 : 0,
        status: 1,
      });
      await hiveRepo.save(hive);
      hiveCount++;
    }
  }
  console.log(`   ✅ 共创建 ${hiveCount} 个蜂箱\n`);

  // ─── 5. 巡检记录 ───
  console.log('🔍 创建巡检记录...');
  const inspectRepo = dataSource.getRepository(Inspection);
  let inspectCount = 0;
  for (const apiary of apiaries) {
    const records = inspectionSeed(apiary.id, apiary.beekeeperId);
    for (const r of records) {
      await inspectRepo.save(inspectRepo.create(r as Inspection));
      inspectCount++;
    }
  }
  console.log(`   ✅ 共创建 ${inspectCount} 条巡检记录\n`);

  // ─── 6. 蜂蜜采收记录 ───
  console.log('🍯 创建蜂蜜采收记录...');
  const harvestRepo = dataSource.getRepository(HoneyHarvest);
  let harvestCount = 0;
  for (const apiary of apiaries) {
    const records = harvestSeed(apiary.id, apiary.beekeeperId);
    for (const r of records) {
      await harvestRepo.save(harvestRepo.create(r as HoneyHarvest));
      harvestCount++;
    }
  }
  console.log(`   ✅ 共创建 ${harvestCount} 条采收记录\n`);

  // ─── 7. 用药记录 ───
  console.log('💉 创建用药记录...');
  const medRepo = dataSource.getRepository(Medication);
  let medCount = 0;
  for (const apiary of apiaries) {
    const records = medSeed(apiary.id, apiary.beekeeperId);
    for (const r of records) {
      await medRepo.save(medRepo.create(r as Medication));
      medCount++;
    }
  }
  console.log(`   ✅ 共创建 ${medCount} 条用药记录\n`);

  // ─── 8. 收支账目 ───
  console.log('💰 创建收支账目...');
  const accountRepo = dataSource.getRepository(Account);
  let accCount = 0;
  for (const bk of beekeepers) {
    if (bk.status !== 1) continue;
    const records = accountSeed(bk.id);
    for (const r of records) {
      await accountRepo.save(accountRepo.create(r as Account));
      accCount++;
    }
  }
  console.log(`   ✅ 共创建 ${accCount} 条账目\n`);

  // ─── 9. 补贴政策 ───
  console.log('📜 创建补贴政策...');
  const policyRepo = dataSource.getRepository(SubsidyPolicy);
  const policiesData: Partial<SubsidyPolicy>[] = [
    {
      name: '2026年泰顺县中蜂养殖扶持政策',
      regionCodes: ['330329'],
      targetTypes: [1, 2, 3],
      standard: '每群中蜂补贴30元/年，专业蜂农（50群以上）额外奖励2000元',
      totalBudget: 500000,
      applyStart: new Date('2026-03-01'),
      applyEnd: new Date('2026-06-30'),
      conditions: '1. 泰顺县户籍蜂农\n2. 养殖中蜂10群以上\n3. 已取得蜂农证',
      materials: '1. 蜂农证复印件\n2. 蜂场照片\n3. 蜂群数量确认表',
      status: 1, // 已发布
      createdBy: admins[0]?.id || 1,
    },
    {
      name: '2026年蜂产品质量安全检测补贴',
      regionCodes: ['330329'],
      targetTypes: [2, 3],
      standard: '每次送检补贴检测费用80%，最高500元/次',
      totalBudget: 100000,
      applyStart: new Date('2026-04-01'),
      applyEnd: new Date('2026-12-31'),
      conditions: '1. 专业或企业级蜂农\n2. 送检机构需为省级以上认证实验室',
      materials: '1. 检测报告\n2. 检测费用发票',
      status: 1,
      createdBy: admins[1]?.id || 2,
    },
    {
      name: '2026年南浦溪镇蜂旅融合示范项目',
      regionCodes: ['330329'],
      targetTypes: [2, 3],
      standard: '入选示范蜂场补贴50000元，用于蜂场环境改造和参观设施建设',
      totalBudget: 200000,
      applyStart: new Date('2026-05-01'),
      applyEnd: new Date('2026-08-31'),
      conditions: '1. 南浦溪镇范围内蜂场\n2. 蜂群数量50群以上\n3. 具备旅游参观条件',
      materials: '1. 项目实施方案\n2. 蜂场现状照片\n3. 环境评估报告',
      status: 0, // 草稿
      createdBy: admins[2]?.id || 3,
    },
  ];
  const policies: SubsidyPolicy[] = [];
  for (const p of policiesData) {
    const policy = policyRepo.create(p as SubsidyPolicy);
    const saved = await policyRepo.save(policy);
    policies.push(saved);
    const statusText = ['草稿', '已发布', '已结束'][p.status as number];
    console.log(`   ✅ ${p.name} [${statusText}]`);
  }
  console.log('');

  // ─── 10. 补贴申请 ───
  console.log('📝 创建补贴申请...');
  const appRepo = dataSource.getRepository(SubsidyApplication);
  const applicationsData: Partial<SubsidyApplication>[] = [];
  const activeBks = beekeepers.filter(b => b.status === 1);

  // 已通过的申请
  applicationsData.push({
    policyId: policies[0]?.id || 1,
    beekeeperId: activeBks[0]?.id || 1,
    colonyCount: 50,
    applyAmount: 3500, // 50*30 + 2000
    approvedAmount: 3500,
    status: 4, // 已发放
    auditNote: '材料齐全，蜂群数量核实无误',
    auditedBy: admins[0]?.id || 1,
    auditedAt: new Date('2026-03-15'),
    paidAt: new Date('2026-04-01'),
  });
  applicationsData.push({
    policyId: policies[0]?.id || 1,
    beekeeperId: activeBks[1]?.id || 2,
    colonyCount: 35,
    applyAmount: 1050,
    approvedAmount: 1050,
    status: 4,
    auditNote: '审核通过',
    auditedBy: admins[1]?.id || 2,
    auditedAt: new Date('2026-03-20'),
    paidAt: new Date('2026-04-05'),
  });
  // 审核中的
  applicationsData.push({
    policyId: policies[0]?.id || 1,
    beekeeperId: activeBks[2]?.id || 3,
    colonyCount: 120,
    applyAmount: 5600,
    status: 1, // 审核中
  });
  applicationsData.push({
    policyId: policies[0]?.id || 1,
    beekeeperId: activeBks[3]?.id || 4,
    colonyCount: 25,
    applyAmount: 750,
    status: 0, // 待审核
  });
  // 已拒绝
  applicationsData.push({
    policyId: policies[1]?.id || 2,
    beekeeperId: activeBks[4]?.id || 5,
    colonyCount: 40,
    applyAmount: 500,
    status: 3, // 已拒绝
    auditNote: '检测机构不符合要求，请重新申请',
    auditedBy: admins[1]?.id || 2,
    auditedAt: new Date('2026-04-10'),
  });

  for (const a of applicationsData) {
    const app = appRepo.create(a as SubsidyApplication);
    await appRepo.save(app);
    const statusText = ['待审核', '审核中', '已通过', '已拒绝', '已发放'][a.status as number];
    console.log(`   ✅ 蜂农ID=${a.beekeeperId} → 政策ID=${a.policyId} [${statusText}] ¥${a.applyAmount}`);
  }
  console.log('');

  // ─── 11. 通知 ───
  console.log('📢 创建通知...');
  const notifRepo = dataSource.getRepository(Notification);
  const notificationsData: Partial<Notification>[] = [
    {
      title: '关于开展2026年中蜂养殖扶持申报的通知',
      type: 1, // 政策
      content: '各位蜂农：2026年度中蜂养殖扶持政策已发布，请符合条件的蜂农于2026年6月30日前完成线上申报。申报材料需包含蜂农证、蜂场照片和蜂群数量确认表。详情请查看补贴政策栏目。',
      regionCodes: ['330329'],
      targetTypes: [1, 2, 3],
      urgency: 2, // 重要
      status: 1,
      publishTime: new Date('2026-03-01 09:00:00'),
      createdBy: admins[0]?.id || 1,
    },
    {
      title: '春季蜂群管理技术指导',
      type: 2, // 技术指导
      content: '春季是蜂群繁殖的关键时期，请注意以下几点：1. 及时检查蜂王产卵情况；2. 适当补充蛋白质饲料（花粉饼）；3. 做好蜂箱保温工作；4. 注意防治螨虫。如有技术问题，可联系县畜牧兽医局蜂业管理科。',
      regionCodes: ['330329'],
      targetTypes: [1, 2, 3],
      urgency: 1,
      status: 1,
      publishTime: new Date('2026-03-15 10:00:00'),
      createdBy: admins[1]?.id || 2,
    },
    {
      title: '蜂群孢子虫病预警',
      type: 3, // 疫情预警
      content: '近期周边地区发现蜂群孢子虫病疫情，请各位蜂农加强巡查，发现蜂群出现排泄异常、采集力下降等症状，立即隔离并上报。预防措施：保持蜂箱干燥通风，避免使用不洁水源。',
      regionCodes: ['330329'],
      targetTypes: [1, 2, 3],
      urgency: 3, // 紧急
      status: 1,
      publishTime: new Date('2026-04-20 14:00:00'),
      createdBy: admins[0]?.id || 1,
    },
    {
      title: '2026年蜂蜜市场行情周报（第16周）',
      type: 4, // 市场信息
      content: '本周蜂蜜市场价格稳定：百花蜜批发价45-65元/kg，零售价80-120元/kg；土蜂蜜批发价80-120元/kg，零售价150-280元/kg。中蜂蜂蜜需求持续旺盛，建议蜂农把握春季采收时机。',
      regionCodes: ['330329'],
      targetTypes: [2, 3],
      urgency: 1,
      status: 1,
      publishTime: new Date('2026-04-21 08:00:00'),
      createdBy: admins[2]?.id || 3,
    },
  ];
  const notifications: Notification[] = [];
  for (const n of notificationsData) {
    const notif = notifRepo.create(n as Notification);
    const saved = await notifRepo.save(notif);
    notifications.push(saved);
    console.log(`   ✅ ${n.title}`);
  }
  console.log('');

  // ─── 12. 蜂农通知关联 ───
  console.log('📬 创建蜂农通知关联...');
  const bkNotifRepo = dataSource.getRepository(BeekeeperNotification);
  let bkNotifCount = 0;
  for (const notif of notifications) {
    for (const bk of activeBks) {
      const bn = bkNotifRepo.create({
        notificationId: notif.id,
        beekeeperId: bk.id,
        isRead: Math.random() > 0.5 ? 1 : 0,
        readAt: Math.random() > 0.5 ? new Date() : undefined,
      });
      await bkNotifRepo.save(bn);
      bkNotifCount++;
    }
  }
  console.log(`   ✅ 共创建 ${bkNotifCount} 条蜂农通知关联\n`);

  // ─── 13. 溯源码 ───
  console.log('🏷️  创建溯源码...');
  const traceRepo = dataSource.getRepository(TraceCode);
  let traceCount = 0;
  for (const apiary of apiaries.slice(0, 5)) {
    const bk = beekeepers.find(b => b.id === apiary.beekeeperId);
    const batchNo = `BT2026${String(new Date().getMonth() + 1).padStart(2, '0')}${String(apiary.id).padStart(4, '0')}`;
    const code = `TRC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const trace = traceRepo.create({
      code,
      beekeeperId: apiary.beekeeperId,
      apiaryId: apiary.id,
      productName: `${bk?.beeBreed || '中蜂'} - ${apiary.honeySource || '百花蜜'}`,
      batchNo,
      spec: '500g',
      produceDate: new Date(),
      shelfLifeMonths: 18,
      traceData: {
        beekeeper: bk?.name,
        beekeeperPhone: bk?.phone,
        region: `${apiary.province}${apiary.city}${apiary.district}${apiary.town}`,
        apiaryName: apiary.name,
        longitude: apiary.longitude,
        latitude: apiary.latitude,
        altitude: apiary.altitude,
        beeBreed: apiary.beeBreed,
        honeySource: apiary.honeySource,
        colonyCount: apiary.colonyCount,
        harvestDate: new Date().toISOString().split('T')[0],
        qualityGrade: '成熟蜜',
        baumeDegree: 42,
      },
      scanCount: Math.floor(Math.random() * 20),
      status: 1,
    });
    await traceRepo.save(trace);
    traceCount++;
  }
  console.log(`   ✅ 共创建 ${traceCount} 个溯源码\n`);

  // ─── 完成 ───
  await dataSource.destroy();

  console.log('═══════════════════════════════════════════');
  console.log('🎉 种子数据生成完成！');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('📋 管理员账号（统一密码: Bee123456）');
  console.log('┌────────────────┬────────────────┬────────┬──────────────┐');
  console.log('│ 用户名          │ 姓名            │ 角色ID │ 区域         │');
  console.log('├────────────────┼────────────────┼────────┼──────────────┤');
  console.log('│ superadmin     │ 超级管理员      │ 1      │ 330329       │');
  console.log('│ taishun_admin  │ 泰顺县管理员    │ 2      │ 330329       │');
  console.log('│ npx_admin      │ 南浦溪镇管理员  │ 3      │ 330329       │');
  console.log('│ operator01     │ 操作员张三      │ 4      │ 330329       │');
  console.log('│ operator02     │ 操作员李四      │ 4      │ 330329       │');
  console.log('└────────────────┴────────────────┴────────┴──────────────┘');
  console.log('');
  console.log('🐝 蜂农账号（微信小程序登录，开发环境直接使用 dev_openid_xxx）');
  console.log('┌────────────┬──────────┬────────┬──────────┐');
  console.log('│ 姓名        │ 手机号    │ 等级   │ 状态     │');
  console.log('├────────────┼──────────┼────────┼──────────┤');
  for (const bk of beekeeperSeed) {
    const levelText = ['', '散户', '专业', '企业'][bk.level as number] || '';
    const statusText = ['待审核', '正常', '冻结', '拒绝'][bk.status as number] || '';
    console.log(`│ ${bk.name!.padEnd(10)} │ ${bk.phone!.padEnd(18)}│ ${levelText.padEnd(6)} │ ${statusText.padEnd(8)} │`);
  }
  console.log('└────────────┴──────────┴────────┴──────────┘');
  console.log('');
  console.log('📊 数据统计:');
  console.log(`   管理员: ${admins.length} 个`);
  console.log(`   蜂农: ${beekeepers.length} 个（正常${beekeepers.filter(b=>b.status===1).length} / 待审核${beekeepers.filter(b=>b.status===0).length} / 冻结${beekeepers.filter(b=>b.status===2).length}）`);
  console.log(`   蜂场: ${apiaries.length} 个`);
  console.log(`   蜂箱: ${hiveCount} 个`);
  console.log(`   巡检记录: ${inspectCount} 条`);
  console.log(`   采收记录: ${harvestCount} 条`);
  console.log(`   用药记录: ${medCount} 条`);
  console.log(`   收支账目: ${accCount} 条`);
  console.log(`   补贴政策: ${policies.length} 个`);
  console.log(`   补贴申请: ${applicationsData.length} 条`);
  console.log(`   通知: ${notifications.length} 条`);
  console.log(`   溯源码: ${traceCount} 个`);
  console.log('');
}

seed().catch((err) => {
  console.error('❌ 种子数据生成失败:', err);
  process.exit(1);
});
