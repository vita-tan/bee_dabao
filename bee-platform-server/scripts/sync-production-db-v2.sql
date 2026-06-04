-- ============================================================
-- 蜂产业大脑 — 线上数据库同步脚本（生产安全版 v2）
-- 修复：DATE NOT NULL 列先以 nullable 添加，再清理脏数据，最后改 NOT NULL
-- 执行前请先备份：mysqldump -u root -p bee_dabao > backup.sql
-- ============================================================

SET NAMES utf8mb4;

-- ─── 1. apiaries ─────────────────────────────────────────────
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `colony_count` INT NOT NULL DEFAULT 0 COMMENT '蜂群数';
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `box_count` INT NOT NULL DEFAULT 0 COMMENT '蜂箱数';
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `altitude` INT DEFAULT NULL COMMENT '海拔(米)';
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `bee_breed` VARCHAR(50) DEFAULT NULL COMMENT '蜂种';
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `is_seasonal` TINYINT NOT NULL DEFAULT 0 COMMENT '是否季节性蜂场: 0否 1是';
ALTER TABLE `apiaries` ADD COLUMN IF NOT EXISTS `last_inspect_at` DATETIME DEFAULT NULL COMMENT '最后巡查时间';

-- ─── 2. honey_harvests（重点：harvest_date 需要分步添加）─────
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `harvest_date` DATE DEFAULT NULL COMMENT '采蜜日期';
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `baume_degree` DECIMAL(4,1) DEFAULT NULL COMMENT '波美度';
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `quality_grade` TINYINT NOT NULL DEFAULT 2 COMMENT '品质等级: 1成熟蜜 2普通蜜';
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `method` TINYINT DEFAULT NULL COMMENT '采蜜方式: 1摇蜜机 2手工';
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `hive_ids` JSON DEFAULT NULL COMMENT '蜂箱ID数组';
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `photos` JSON DEFAULT NULL COMMENT '照片URL数组';
ALTER TABLE `honey_harvests` ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL COMMENT '备注';

-- ─── 3. inspections（inspect_date 分步添加）──────────────────
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `inspect_date` DATE DEFAULT NULL COMMENT '巡查日期';
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `hive_ids` JSON DEFAULT NULL COMMENT '蜂箱ID数组';
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `hive_count` INT NOT NULL DEFAULT 0 COMMENT '巡查蜂箱数';
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `overall_health` TINYINT NOT NULL DEFAULT 2 COMMENT '整体健康: 1良好 2正常 3需关注 4异常';
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `queen_status` TINYINT DEFAULT NULL COMMENT '蜂王状况: 1正常 2异常 3待观察';
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `brood_status` TINYINT DEFAULT NULL COMMENT '子脾状况: 1良好 2一般 3较差';
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `honey_storage` TINYINT DEFAULT NULL COMMENT '蜂蜜储量: 1充足 2一般 3不足';
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `photos` JSON DEFAULT NULL COMMENT '照片URL数组';
ALTER TABLE `inspections` ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL COMMENT '备注';

-- ─── 4. medications（med_date / withdraw_end 分步添加）────────
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `med_date` DATE DEFAULT NULL COMMENT '用药日期';
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `withdraw_days` TINYINT NOT NULL DEFAULT 30 COMMENT '停药天数';
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `withdraw_end` DATE DEFAULT NULL COMMENT '停药期截止日';
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人';
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `photos` JSON DEFAULT NULL COMMENT '照片URL数组';
ALTER TABLE `medications` ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL COMMENT '备注';

-- ─── 5. subsidy_applications ──────────────────────────────────
ALTER TABLE `subsidy_applications` ADD COLUMN IF NOT EXISTS `apiary_ids` JSON DEFAULT NULL COMMENT '关联蜂场ID数组';
ALTER TABLE `subsidy_applications` ADD COLUMN IF NOT EXISTS `materials` JSON DEFAULT NULL COMMENT '申请材料URL数组';

-- ─── 6. subsidy_policies ────────────────────────────────────
ALTER TABLE `subsidy_policies` ADD COLUMN IF NOT EXISTS `region_codes` JSON DEFAULT NULL COMMENT '适用区域代码数组';
ALTER TABLE `subsidy_policies` ADD COLUMN IF NOT EXISTS `target_types` JSON DEFAULT NULL COMMENT '适用蜂农类型数组';
ALTER TABLE `subsidy_policies` ADD COLUMN IF NOT EXISTS `conditions` TEXT DEFAULT NULL COMMENT '申请条件';
ALTER TABLE `subsidy_policies` ADD COLUMN IF NOT EXISTS `materials` TEXT DEFAULT NULL COMMENT '所需材料说明';

-- ─── 7. trace_codes ──────────────────────────────────────────
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `batch_no` VARCHAR(50) DEFAULT NULL COMMENT '批次号';
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `shelf_life_months` TINYINT NOT NULL DEFAULT 12 COMMENT '保质期(月)';
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `trace_data` JSON DEFAULT NULL COMMENT '溯源链路数据(JSON)';
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `scan_count` INT NOT NULL DEFAULT 0 COMMENT '扫码次数';
ALTER TABLE `trace_codes` ADD COLUMN IF NOT EXISTS `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1有效 0撤销';

-- ─── 8. hives ──────────────────────────────────────────────
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `intro_date` DATE DEFAULT NULL COMMENT '引入日期';
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `queen_status` TINYINT NOT NULL DEFAULT 1 COMMENT '蜂王状态: 1正常 2失王 3待确认';
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `in_withdraw` TINYINT NOT NULL DEFAULT 0 COMMENT '是否在停药期: 0否 1是';
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `withdraw_end` DATE DEFAULT NULL COMMENT '停药期截止日';
ALTER TABLE `hives` ADD COLUMN IF NOT EXISTS `notes` VARCHAR(500) DEFAULT NULL COMMENT '备注';

-- ─── 9. accounts（record_date 分步添加）────────────────────
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `record_date` DATE DEFAULT NULL COMMENT '记录日期';
ALTER TABLE `accounts` ADD COLUMN IF NOT EXISTS `receipt_images` JSON DEFAULT NULL COMMENT '收据图片URL数组';

-- ─── 10. notifications ─────────────────────────────────────
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `region_codes` JSON DEFAULT NULL COMMENT '推送区域代码数组';
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `target_types` JSON DEFAULT NULL COMMENT '推送蜂农类型数组';
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `urgency` TINYINT NOT NULL DEFAULT 1 COMMENT '紧急程度: 1普通 2重要 3紧急';
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `attachments` JSON DEFAULT NULL COMMENT '附件URL数组';
ALTER TABLE `notifications` ADD COLUMN IF NOT EXISTS `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间';

-- ─── 11. beekeepers ───────────────────────────────────────
ALTER TABLE `beekeepers` ADD COLUMN IF NOT EXISTS `credit_score` TINYINT NOT NULL DEFAULT 80 COMMENT '信用分';
ALTER TABLE `beekeepers` ADD COLUMN IF NOT EXISTS `audit_note` VARCHAR(500) DEFAULT NULL COMMENT '审核备注';
ALTER TABLE `beekeepers` ADD COLUMN IF NOT EXISTS `audited_at` DATETIME DEFAULT NULL COMMENT '审核时间';
ALTER TABLE `beekeepers` ADD COLUMN IF NOT EXISTS `audited_by` BIGINT DEFAULT NULL COMMENT '审核人ID';

-- ─── 12. beekeeper_notifications 建表 ──────────────────────
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
-- 第二阶段：处理 DATE 列的 NOT NULL 转换（先清脏数据再改）
-- ============================================================

-- 关闭严格模式，允许处理无效日期
SET sql_mode = '';

-- 清理 honey_harvests.harvest_date 的脏数据
UPDATE `honey_harvests` SET `harvest_date` = NULL WHERE `harvest_date` IS NOT NULL AND (`harvest_date` < '1000-01-01' OR `harvest_date` = '0000-00-00');
UPDATE `honey_harvests` SET `harvest_date` = COALESCE(DATE(`created_at`), CURDATE()) WHERE `harvest_date` IS NULL;
ALTER TABLE `honey_harvests` MODIFY COLUMN `harvest_date` DATE NOT NULL COMMENT '采蜜日期';

-- 清理 inspections.inspect_date 的脏数据
UPDATE `inspections` SET `inspect_date` = NULL WHERE `inspect_date` IS NOT NULL AND (`inspect_date` < '1000-01-01' OR `inspect_date` = '0000-00-00');
UPDATE `inspections` SET `inspect_date` = COALESCE(DATE(`created_at`), CURDATE()) WHERE `inspect_date` IS NULL;
ALTER TABLE `inspections` MODIFY COLUMN `inspect_date` DATE NOT NULL COMMENT '巡查日期';

-- 清理 medications.med_date 的脏数据
UPDATE `medications` SET `med_date` = NULL WHERE `med_date` IS NOT NULL AND (`med_date` < '1000-01-01' OR `med_date` = '0000-00-00');
UPDATE `medications` SET `med_date` = COALESCE(DATE(`created_at`), CURDATE()) WHERE `med_date` IS NULL;
ALTER TABLE `medications` MODIFY COLUMN `med_date` DATE NOT NULL COMMENT '用药日期';

-- 清理 accounts.record_date 的脏数据
UPDATE `accounts` SET `record_date` = NULL WHERE `record_date` IS NOT NULL AND (`record_date` < '1000-01-01' OR `record_date` = '0000-00-00');
UPDATE `accounts` SET `record_date` = COALESCE(DATE(`created_at`), CURDATE()) WHERE `record_date` IS NULL;
ALTER TABLE `accounts` MODIFY COLUMN `record_date` DATE NOT NULL COMMENT '记录日期';

-- 恢复严格模式
SET sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ============================================================
-- 完成！所有缺失列已补齐，DATE NOT NULL 列已安全转换。
-- ============================================================
