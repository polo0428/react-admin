/*
  CET 成绩表字段调整（2026-01-20）
  用于适配新的成绩导入模板（支持证件号码、无准考证号等情况）
*/

-- 切换到目标数据库 (请确认你的数据库名称是否为 react-admin)
USE `react-admin`;

SET NAMES utf8mb4;

-- 1) 允许学号为空 (兼容新模板可能不提供学号，改用证件号匹配)
ALTER TABLE `xmw_cet_score`
  MODIFY COLUMN `student_no` varchar(50) NULL COMMENT '学号';

-- 2) 允许准考证号为空 (兼容新模板可能不提供准考证号)
ALTER TABLE `xmw_cet_score`
  MODIFY COLUMN `ticket_number` varchar(50) NULL COMMENT '准考证号';

-- 3) 新增字段列 (补充学生详细信息)
-- 注意：如果字段已存在，再次执行会报错 Duplicate column，忽略即可
ALTER TABLE `xmw_cet_score`
  ADD COLUMN `id_card` varchar(32) NULL COMMENT '证件号码' AFTER `student_no`,
  ADD COLUMN `grade` varchar(20) NULL COMMENT '年级' AFTER `id_card`,
  ADD COLUMN `teaching_class` varchar(100) NULL COMMENT '教学班' AFTER `class_name`,
  ADD COLUMN `brigade` varchar(100) NULL COMMENT '学员大队' AFTER `teaching_class`,
  ADD COLUMN `squadron` varchar(100) NULL COMMENT '学员队' AFTER `brigade`,
  ADD COLUMN `student_type` varchar(50) NULL COMMENT '学员类型' AFTER `squadron`;

-- 4) 索引建议 (优化查询性能)
-- CREATE INDEX `idx_cet_score_batch_id_card` ON `xmw_cet_score` (`batch_id`, `id_card`);
