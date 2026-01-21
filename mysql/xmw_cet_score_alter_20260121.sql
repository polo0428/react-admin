/*
  CET 成绩表新增字段：培养层次（2026-01-21）
  - 1: 大专
  - 2: 本科
  - 3: 研究生
*/

USE `react-admin`;
SET NAMES utf8mb4;

-- 注意：如果字段已存在，再次执行会报错 Duplicate column，忽略即可
ALTER TABLE `xmw_cet_score`
  ADD COLUMN `cultivation_level` tinyint NULL COMMENT '培养层次(1大专/2本科/3研究生)' AFTER `student_type`;


