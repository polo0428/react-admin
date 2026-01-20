/*
  CET 报名导入模板字段调整（2026-01-20）

  你的新模板字段：
  - 姓名
  - 证件号码
  - 报考级别
  - 年级
  - 专业
  - 教学班
  - 学员大队
  - 学员队
  - 学员类型

  配套后端已做兼容：
  - 旧字段（学号/学院/班级/校区/准考证号）仍可导入、查询
  - 新字段写入到新增列（id_card/grade/teaching_class/brigade/squadron/student_type）

  注意：如果你数据库里 `xmw_cet_registration.student_no` 目前是 NOT NULL，
  必须先把它改成可空，否则新模板（不提供学号）会插入失败。
*/

SET NAMES utf8mb4;

-- 1) 学号改为可空（兼容新模板可能不提供学号）
ALTER TABLE `xmw_cet_registration`
  MODIFY COLUMN `student_no` varchar(50) NULL COMMENT '学号';

-- 2) 新增字段列（按需调整 varchar 长度/注释）
ALTER TABLE `xmw_cet_registration`
  ADD COLUMN `id_card` varchar(32) NULL COMMENT '证件号码' AFTER `student_no`,
  ADD COLUMN `grade` varchar(20) NULL COMMENT '年级' AFTER `id_card`,
  ADD COLUMN `teaching_class` varchar(100) NULL COMMENT '教学班' AFTER `class_name`,
  ADD COLUMN `brigade` varchar(100) NULL COMMENT '学员大队' AFTER `teaching_class`,
  ADD COLUMN `squadron` varchar(100) NULL COMMENT '学员队' AFTER `brigade`,
  ADD COLUMN `student_type` varchar(50) NULL COMMENT '学员类型' AFTER `squadron`;

-- 3) 可选：加索引（按业务自行选择是否执行）
-- 建议：同一考次下，证件号码/学号/准考证号用于去重匹配与搜索
-- CREATE INDEX `idx_cet_reg_batch_id_card` ON `xmw_cet_registration` (`batch_id`, `id_card`);
-- CREATE INDEX `idx_cet_reg_batch_student_no` ON `xmw_cet_registration` (`batch_id`, `student_no`);
-- CREATE INDEX `idx_cet_reg_batch_ticket` ON `xmw_cet_registration` (`batch_id`, `ticket_number`);


