-- ============================================================
-- 蜂产业大脑 — 线上数据库同步脚本（MySQL 8.0.12 兼容版 v3）
-- 兼容：MySQL 8.0.12+（不依赖 IF NOT EXISTS 语法）
-- 执行前请先备份：mysqldump -u root -p bee_dabao > backup.sql
-- 用法：mysql -u root -p bee_dabao < sync-production-db-v3.sql
-- ============================================================

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS `safe_add_column`;
DELIMITER $$
CREATE PROCEDURE `safe_add_column`(
  IN p_table VARCHAR(64),
  IN p_column VARCHAR(64),
  IN p_definition VARCHAR(500)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = p_table
      AND COLUMN_NAME = p_column
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$
DELIMITER ;

-- ============================================================
-- 第一阶段：添加所有缺失列（已存在则自动跳过）
-- ============================================================

-- ─── 1. apiaries ─────────────────────────────────────────────
CALL safe_add_column('apiaries', 'colony_count', 'INT NOT NULL DEFAULT 0 COMMENT "蜂群数"');
CALL safe_add_column('apiaries', 'box_count', 'INT NOT NULL DEFAULT 0 COMMENT "蜂箱数"');
CALL safe_add_column('apiaries', 'altitude', 'INT DEFAULT NULL COMMENT "海拔(米)"');
CALL safe_add_column('apiaries', 'bee_breed', 'VARCHAR(50) DEFAULT NULL COMMENT "蜂种"');
CALL safe_add_column('apiaries', 'is_seasonal', 'TINYINT NOT NULL DEFAULT 0 COMMENT "是否季节性蜂场: 0否 1是"');
CALL safe_add_column('apiaries', 'last_inspect_at', 'DATETIME DEFAULT NULL COMMENT "最后巡查时间"');

-- ─── 2. honey_harvests ─────────────────────────────────────
CALL safe_add_column('honey_harvests', 'harvest_date', 'DATE DEFAULT NULL COMMENT "采蜜日期"');
CALL safe_add_column('honey_harvests', 'baume_degree', 'DECIMAL(4,1) DEFAULT NULL COMMENT "波美度"');
CALL safe_add_column('honey_harvests', 'quality_grade', 'TINYINT NOT NULL DEFAULT 2 COMMENT "品质等级: 1成熟蜜 2普通蜜"');
CALL safe_add_column('honey_harvests', 'method', 'TINYINT DEFAULT NULL COMMENT "采蜜方式: 1摇蜜机 2手工"');
CALL safe_add_column('honey_harvests', 'hive_ids', 'JSON DEFAULT NULL COMMENT "蜂箱ID数组"');
CALL safe_add_column('honey_harvests', 'photos', 'JSON DEFAULT NULL COMMENT "照片URL数组"');
CALL safe_add_column('honey_harvests', 'notes', 'TEXT DEFAULT NULL COMMENT "备注"');

-- ─── 3. inspections ─────────────────────────────────────────
CALL safe_add_column('inspections', 'inspect_date', 'DATE DEFAULT NULL COMMENT "巡查日期"');
CALL safe_add_column('inspections', 'hive_ids', 'JSON DEFAULT NULL COMMENT "蜂箱ID数组"');
CALL safe_add_column('inspections', 'hive_count', 'INT NOT NULL DEFAULT 0 COMMENT "巡查蜂箱数"');
CALL safe_add_column('inspections', 'overall_health', 'TINYINT NOT NULL DEFAULT 2 COMMENT "整体健康: 1良好 2正常 3需关注 4异常"');
CALL safe_add_column('inspections', 'queen_status', 'TINYINT DEFAULT NULL COMMENT "蜂王状况: 1正常 2异常 3待观察"');
CALL safe_add_column('inspections', 'brood_status', 'TINYINT DEFAULT NULL COMMENT "子脾状况: 1良好 2一般 3较差"');
CALL safe_add_column('inspections', 'honey_storage', 'TINYINT DEFAULT NULL COMMENT "蜂蜜储量: 1充足 2一般 3不足"');
CALL safe_add_column('inspections', 'photos', 'JSON DEFAULT NULL COMMENT "照片URL数组"');
CALL safe_add_column('inspections', 'notes', 'TEXT DEFAULT NULL COMMENT "备注"');

-- ─── 4. medications ─────────────────────────────────────────
CALL safe_add_column('medications', 'med_date', 'DATE DEFAULT NULL COMMENT "用药日期"');
CALL safe_add_column('medications', 'withdraw_days', 'TINYINT NOT NULL DEFAULT 30 COMMENT "停药天数"');
CALL safe_add_column('medications', 'withdraw_end', 'DATE DEFAULT NULL COMMENT "停药期截止日"');
CALL safe_add_column('medications', 'operator', 'VARCHAR(50) DEFAULT NULL COMMENT "操作人"');
CALL safe_add_column('medications', 'photos', 'JSON DEFAULT NULL COMMENT "照片URL数组"');
CALL safe_add_column('medications', 'notes', 'TEXT DEFAULT NULL COMMENT "备注"');

-- ─── 5. subsidy_applications ──────────────────────────────────
CALL safe_add_column('subsidy_applications', 'apiary_ids', 'JSON DEFAULT NULL COMMENT "关联蜂场ID数组"');
CALL safe_add_column('subsidy_applications', 'materials', 'JSON DEFAULT NULL COMMENT "申请材料URL数组"');

-- ─── 6. subsidy_policies ────────────────────────────────────
CALL safe_add_column('subsidy_policies', 'region_codes', 'JSON DEFAULT NULL COMMENT "适用区域代码数组"');
CALL safe_add_column('subsidy_policies', 'target_types', 'JSON DEFAULT NULL COMMENT "适用蜂农类型数组"');
CALL safe_add_column('subsidy_policies', 'conditions', 'TEXT DEFAULT NULL COMMENT "申请条件"');
CALL safe_add_column('subsidy_policies', 'materials', 'TEXT DEFAULT NULL COMMENT "所需材料说明"');

-- ─── 7. trace_codes ──────────────────────────────────────────
CALL safe_add_column('trace_codes', 'batch_no', 'VARCHAR(50) DEFAULT NULL COMMENT "批次号"');
CALL safe_add_column('trace_codes', 'shelf_life_months', 'TINYINT NOT NULL DEFAULT 12 COMMENT "保质期(月)"');
CALL safe_add_column('trace_codes', 'trace_data', 'JSON DEFAULT NULL COMMENT "溯源链路数据(JSON)"');
CALL safe_add_column('trace_codes', 'scan_count', 'INT NOT NULL DEFAULT 0 COMMENT "扫码次数"');
CALL safe_add_column('trace_codes', 'status', 'TINYINT NOT NULL DEFAULT 1 COMMENT "状态: 1有效 0撤销"');

-- ─── 8. hives ──────────────────────────────────────────────
CALL safe_add_column('hives', 'intro_date', 'DATE DEFAULT NULL COMMENT "引入日期"');
CALL safe_add_column('hives', 'queen_status', 'TINYINT NOT NULL DEFAULT 1 COMMENT "蜂王状态: 1正常 2失王 3待确认"');
CALL safe_add_column('hives', 'in_withdraw', 'TINYINT NOT NULL DEFAULT 0 COMMENT "是否在停药期: 0否 1是"');
CALL safe_add_column('hives', 'withdraw_end', 'DATE DEFAULT NULL COMMENT "停药期截止日"');
CALL safe_add_column('hives', 'notes', 'VARCHAR(500) DEFAULT NULL COMMENT "备注"');

-- ─── 9. accounts ─────────────────────────────────────────────
CALL safe_add_column('accounts', 'record_date', 'DATE DEFAULT NULL COMMENT "记录日期"');
CALL safe_add_column('accounts', 'receipt_images', 'JSON DEFAULT NULL COMMENT "收据图片URL数组"');

-- ─── 10. notifications ──────────────────────────────────────
CALL safe_add_column('notifications', 'region_codes', 'JSON DEFAULT NULL COMMENT "推送区域代码数组"');
CALL safe_add_column('notifications', 'target_types', 'JSON DEFAULT NULL COMMENT "推送蜂农类型数组"');
CALL safe_add_column('notifications', 'urgency', 'TINYINT NOT NULL DEFAULT 1 COMMENT "紧急程度: 1普通 2重要 3紧急"');
CALL safe_add_column('notifications', 'attachments', 'JSON DEFAULT NULL COMMENT "附件URL数组"');
CALL safe_add_column('notifications', 'publish_time', 'DATETIME DEFAULT NULL COMMENT "发布时间"');

-- ─── 11. beekeepers ─────────────────────────────────────────
CALL safe_add_column('beekeepers', 'credit_score', 'TINYINT NOT NULL DEFAULT 80 COMMENT "信用分"');
CALL safe_add_column('beekeepers', 'audit_note', 'VARCHAR(500) DEFAULT NULL COMMENT "审核备注"');
CALL safe_add_column('beekeepers', 'audited_at', 'DATETIME DEFAULT NULL COMMENT "审核时间"');
CALL safe_add_column('beekeepers', 'audited_by', 'BIGINT DEFAULT NULL COMMENT "审核人ID"');

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
-- 第二阶段：DATE 列安全转 NOT NULL（清脏数据 + 回填）
-- ============================================================

SET sql_mode = '';

-- honey_harvests.harvest_date
UPDATE `honey_harvests` SET `harvest_date` = NULL WHERE `harvest_date` IS NOT NULL AND (`harvest_date` < '1000-01-01' OR `harvest_date` = '0000-00-00');
UPDATE `honey_harvests` SET `harvest_date` = COALESCE(DATE(`created_at`), CURDATE()) WHERE `harvest_date` IS NULL;
ALTER TABLE `honey_harvests` MODIFY COLUMN `harvest_date` DATE NOT NULL COMMENT '采蜜日期';

-- inspections.inspect_date
UPDATE `inspections` SET `inspect_date` = NULL WHERE `inspect_date` IS NOT NULL AND (`inspect_date` < '1000-01-01' OR `inspect_date` = '0000-00-00');
UPDATE `inspections` SET `inspect_date` = COALESCE(DATE(`created_at`), CURDATE()) WHERE `inspect_date` IS NULL;
ALTER TABLE `inspections` MODIFY COLUMN `inspect_date` DATE NOT NULL COMMENT '巡查日期';

-- medications.med_date
UPDATE `medications` SET `med_date` = NULL WHERE `med_date` IS NOT NULL AND (`med_date` < '1000-01-01' OR `med_date` = '0000-00-00');
UPDATE `medications` SET `med_date` = COALESCE(DATE(`created_at`), CURDATE()) WHERE `med_date` IS NULL;
ALTER TABLE `medications` MODIFY COLUMN `med_date` DATE NOT NULL COMMENT '用药日期';

-- accounts.record_date
UPDATE `accounts` SET `record_date` = NULL WHERE `record_date` IS NOT NULL AND (`record_date` < '1000-01-01' OR `record_date` = '0000-00-00');
UPDATE `accounts` SET `record_date` = COALESCE(DATE(`created_at`), CURDATE()) WHERE `record_date` IS NULL;
ALTER TABLE `accounts` MODIFY COLUMN `record_date` DATE NOT NULL COMMENT '记录日期';

-- 恢复严格模式
SET sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- 清理辅助存储过程
DROP PROCEDURE IF EXISTS `safe_add_column`;

-- ============================================================
-- 完成！所有缺失列已补齐，DATE NOT NULL 列已安全转换。
-- ============================================================
