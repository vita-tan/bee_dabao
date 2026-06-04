-- ============================================================
-- 蜂产业大脑 — 线上数据库同步脚本
-- 根据 TypeORM Entity 定义生成，用于补齐缺失的列/表
-- 执行前请先备份：mysqldump -u root -p bee_dabao > backup.sql
-- ============================================================

-- ─── 1. apiaries ─────────────────────────────────────────────
-- colony_count: 蜂群数 (实体 apiary.entity.ts)
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `colony_count` INT NOT NULL DEFAULT 0 COMMENT '蜂群数';

-- box_count: 蜂箱数
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `box_count` INT NOT NULL DEFAULT 0 COMMENT '蜂箱数';

-- altitude: 海拔(米)
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `altitude` INT DEFAULT NULL COMMENT '海拔(米)';

-- bee_breed: 蜂种
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `bee_breed` VARCHAR(50) DEFAULT NULL COMMENT '蜂种';

-- is_seasonal: 是否季节性蜂场
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `is_seasonal` TINYINT NOT NULL DEFAULT 0 COMMENT '是否季节性蜂场: 0否 1是';

-- last_inspect_at: 最后巡查时间
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `last_inspect_at` DATETIME DEFAULT NULL COMMENT '最后巡查时间';

-- ─── 2. honey_harvests ───────────────────────────────────────
-- harvest_date: 采蜜日期 (实体 honey-harvest.entity.ts)
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `harvest_date` DATE NOT NULL COMMENT '采蜜日期';

-- baume_degree: 波美度
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `baume_degree` DECIMAL(4,1) DEFAULT NULL COMMENT '波美度';

-- quality_grade: 品质等级
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `quality_grade` TINYINT NOT NULL DEFAULT 2 COMMENT '品质等级: 1成熟蜜 2普通蜜';

-- method: 采蜜方式
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `method` TINYINT DEFAULT NULL COMMENT '采蜜方式: 1摇蜜机 2手工';

-- hive_ids: 蜂箱ID数组 (JSON)
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `hive_ids` JSON DEFAULT NULL COMMENT '蜂箱ID数组';

-- photos: 照片URL数组 (JSON)
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `photos` JSON DEFAULT NULL COMMENT '照片URL数组';

-- notes: 备注
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL COMMENT '备注';

-- ─── 3. inspections ─────────────────────────────────────────
-- inspect_date: 巡查日期
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `inspect_date` DATE NOT NULL COMMENT '巡查日期';

-- hive_ids: 蜂箱ID数组 (JSON)
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `hive_ids` JSON DEFAULT NULL COMMENT '蜂箱ID数组';

-- hive_count: 巡查蜂箱数
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `hive_count` INT NOT NULL COMMENT '巡查蜂箱数';

-- overall_health: 整体健康
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `overall_health` TINYINT NOT NULL COMMENT '整体健康: 1良好 2正常 3需关注 4异常';

-- queen_status: 蜂王状况
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `queen_status` TINYINT DEFAULT NULL COMMENT '蜂王状况: 1正常 2异常 3待观察';

-- brood_status: 子脾状况
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `brood_status` TINYINT DEFAULT NULL COMMENT '子脾状况: 1良好 2一般 3较差';

-- honey_storage: 蜂蜜储量
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `honey_storage` TINYINT DEFAULT NULL COMMENT '蜂蜜储量: 1充足 2一般 3不足';

-- photos: 照片URL数组 (JSON)
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `photos` JSON DEFAULT NULL COMMENT '照片URL数组';

-- notes: 备注
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL COMMENT '备注';

-- ─── 4. medications ─────────────────────────────────────────
-- med_date: 用药日期
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `med_date` DATE NOT NULL COMMENT '用药日期';

-- withdraw_days: 停药天数
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `withdraw_days` TINYINT NOT NULL COMMENT '停药天数';

-- withdraw_end: 停药期截止日
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `withdraw_end` DATE DEFAULT NULL COMMENT '停药期截止日';

-- operator: 操作人
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人';

-- photos: 照片URL数组 (JSON)
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `photos` JSON DEFAULT NULL COMMENT '照片URL数组';

-- notes: 备注
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL COMMENT '备注';

-- ─── 5. subsidy_applications ──────────────────────────────────
-- apiary_ids: 关联蜂场ID数组 (JSON)
ALTER TABLE `subsidy_applications` ADD COLUMN IF NOT EXISTS `apiary_ids` JSON DEFAULT NULL COMMENT '关联蜂场ID数组';

-- materials: 申请材料URL数组 (JSON)
ALTER TABLE `subsidy_applications` ADD COLUMN IF NOT EXISTS `materials` JSON DEFAULT NULL COMMENT '申请材料URL数组';

-- ─── 6. subsidy_policies ────────────────────────────────────
-- region_codes: 适用区域代码数组 (JSON)
ALTER TABLE `subsidy_policies` ADD COLUMN IF NOT EXISTS `region_codes` JSON DEFAULT NULL COMMENT '适用区域代码数组';

-- target_types: 适用蜂农类型数组 (JSON)
ALTER TABLE `subsidy_policies` ADD COLUMN IF NOT EXISTS `target_types` JSON DEFAULT NULL COMMENT '适用蜂农类型数组';

-- conditions: 申请条件
ALTER TABLE `subsidy_policies` ADD COLUMN IF NOT EXISTS `conditions` TEXT DEFAULT NULL COMMENT '申请条件';

-- materials: 所需材料说明
ALTER TABLE `subsidy_policies` ADD COLUMN IF NOT EXISTS `materials` TEXT DEFAULT NULL COMMENT '所需材料说明';

-- ─── 7. trace_codes ──────────────────────────────────────────
-- batch_no: 批次号
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `batch_no` VARCHAR(50) DEFAULT NULL COMMENT '批次号';

-- shelf_life_months: 保质期(月)
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `shelf_life_months` TINYINT NOT NULL COMMENT '保质期(月)';

-- trace_data: 溯源链路数据 (JSON)
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `trace_data` JSON DEFAULT NULL COMMENT '溯源链路数据(JSON)';

-- scan_count: 扫码次数
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `scan_count` INT NOT NULL DEFAULT 0 COMMENT '扫码次数';

-- status: 状态
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1有效 0撤销';

-- ─── 8. hives ──────────────────────────────────────────────
-- intro_date: 引入日期
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `intro_date` DATE DEFAULT NULL COMMENT '引入日期';

-- queen_status: 蜂王状态
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `queen_status` TINYINT NOT NULL DEFAULT 1 COMMENT '蜂王状态: 1正常 2失王 3待确认';

-- in_withdraw: 是否在停药期
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `in_withdraw` TINYINT NOT NULL DEFAULT 0 COMMENT '是否在停药期: 0否 1是';

-- withdraw_end: 停药期截止日
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `withdraw_end` DATE DEFAULT NULL COMMENT '停药期截止日';

-- notes: 备注
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `notes` VARCHAR(500) DEFAULT NULL COMMENT '备注';

-- ─── 9. accounts ─────────────────────────────────────────────
-- record_date: 记录日期
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `record_date` DATE NOT NULL COMMENT '记录日期';

-- receipt_images: 收据图片URL数组 (JSON)
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `receipt_images` JSON DEFAULT NULL COMMENT '收据图片URL数组';

-- ─── 10. notifications ───────────────────────────────────────
-- region_codes: 推送区域代码数组 (JSON)
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `region_codes` JSON DEFAULT NULL COMMENT '推送区域代码数组';

-- target_types: 推送蜂农类型数组 (JSON)
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `target_types` JSON DEFAULT NULL COMMENT '推送蜂农类型数组';

-- urgency: 紧急程度
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `urgency` TINYINT NOT NULL DEFAULT 1 COMMENT '紧急程度: 1普通 2重要 3紧急';

-- attachments: 附件URL数组 (JSON)
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `attachments` JSON DEFAULT NULL COMMENT '附件URL数组';

-- publish_time: 发布时间
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间';

-- ─── 11. beekeepers ────────────────────────────────────────
-- credit_score: 信用分
ALTER TABLE `beekeepers` ADD COLUMN IF NOT EXISTS `credit_score` TINYINT NOT NULL DEFAULT 80 COMMENT '信用分';

-- audit_note: 审核备注
ALTER TABLE `beekeepers` ADD COLUMN IF NOT EXISTS `audit_note` VARCHAR(500) DEFAULT NULL COMMENT '审核备注';

-- audited_at: 审核时间
ALTER TABLE `beekeepers` ADD COLUMN IF NOT EXISTS `audited_at` DATETIME DEFAULT NULL COMMENT '审核时间';

-- audited_by: 审核人ID
ALTER TABLE `beekeepers` ADD COLUMN IF NOT EXISTS `audited_by` BIGINT DEFAULT NULL COMMENT '审核人ID';

-- ─── 12. beekeeper_notifications ────────────────────────────
CREATE TABLE IF NOT EXISTS `beekeeper_notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `notification_id` BIGINT NOT NULL COMMENT '通知ID',
  `beekeeper_id` BIGINT NOT NULL COMMENT '蜂农ID',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0否 1是',
  `read_at` DATETIME DEFAULT NULL COMMENT '阅读时间',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_bk_notif_notification` (`notification_id`),
  INDEX `idx_bk_notif_beekeeper` (`beekeeper_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='蜂农通知阅读记录';

-- ============================================================
-- 完成！请检查是否有报错（重复列会自动跳过，IF NOT EXISTS 保护）
-- ============================================================
