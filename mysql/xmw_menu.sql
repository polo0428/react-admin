/*
 Navicat Premium Dump SQL

 Source Server         : 腾讯云 - Mysql
 Source Server Type    : MySQL
 Source Server Version : 80200 (8.2.0)
 Source Host           : 43.139.247.208:3306
 Source Schema         : xmw_admin

 Target Server Type    : MySQL
 Target Server Version : 80200 (8.2.0)
 File Encoding         : 65001

 Date: 29/10/2024 09:29:50
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for xmw_menu
-- ----------------------------
DROP TABLE IF EXISTS `xmw_menu`;
CREATE TABLE `xmw_menu`  (
  `menu_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '菜单id',
  `name` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '国际化对应的name',
  `menu_type` enum('dir','menu','button') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '菜单类型（dir:目录，menu:菜单,button:按钮）',
  `path` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '路由url',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '菜单图标',
  `component` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '菜单对应的文件路径',
  `redirect` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '路由重定向地址',
  `parent_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL COMMENT '父级id',
  `target` enum('_blank','_self','_parent','_top') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '当path是一个url，点击新窗口打开',
  `permission` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '菜单标识(页面按钮权限控制)',
  `layout` enum('side','top','mix') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '是否显示layout布局（side:侧边菜单，top:顶部菜单,mix:混合菜单）',
  `navTheme` enum('dark','light') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '导航菜单的主题（dark:暗黑风格，light:亮色风格）',
  `headerTheme` enum('dark','light') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '顶部导航的主题，mix 模式生效（dark:暗黑风格，light:亮色风格）',
  `hideChildrenInMenu` int NULL DEFAULT NULL COMMENT '是否隐藏子路由',
  `hideInMenu` int NULL DEFAULT NULL COMMENT '是否隐藏菜单，包括子路由',
  `hideInBreadcrumb` int NULL DEFAULT NULL COMMENT '是否在面包屑中隐藏',
  `headerRender` int NULL DEFAULT NULL COMMENT '是否显示顶栏',
  `footerRender` int NULL DEFAULT NULL COMMENT '是否显示页脚',
  `menuRender` int NULL DEFAULT NULL COMMENT '当前路由是否展示菜单',
  `menuHeaderRender` int NULL DEFAULT NULL COMMENT '当前路由是否展示菜单顶栏',
  `flatMenu` int NULL DEFAULT NULL COMMENT '子项往上提，只是不展示父菜单',
  `fixedHeader` int NULL DEFAULT NULL COMMENT '固定顶栏',
  `fixSiderbar` int NULL DEFAULT NULL COMMENT '固定菜单',
  `founder` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '创建人',
  `sort` int NOT NULL COMMENT '排序',
  `status` int NOT NULL COMMENT '菜单状态（0:禁用，1：正常）',
  `created_time` datetime NOT NULL,
  `updated_time` datetime NOT NULL,
  PRIMARY KEY (`menu_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of xmw_menu
-- ----------------------------
INSERT INTO `xmw_menu` VALUES ('1360556e-3106-48aa-a030-90edfd7073ea', '3b260bca-826a-4667-b1da-90bb185b8a61', 'button', NULL, NULL, NULL, NULL, 'dd8304e6-09e5-4fa8-8e56-bbefd4e69c0c', NULL, 'administrative:organization:add', NULL, NULL, NULL, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2022-10-27 16:37:44', '2022-10-27 16:37:44');
INSERT INTO `xmw_menu` VALUES ('2710e59a-0b37-4ea7-b6aa-73ffe2298391', '61a3ef50-2bd0-4093-bae1-e6bc494369e6', 'button', NULL, NULL, NULL, NULL, 'b5c00c90-c7dc-4c9a-aa10-85e8c1959f8a', NULL, 'administrative:announcement:delete', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, NULL, NULL, NULL, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2023-08-28 09:40:57', '2023-08-28 09:40:57');
INSERT INTO `xmw_menu` VALUES ('2e1d74aa-2356-4b26-8488-7c337ae306cc', '0ed7bafd-c469-4792-9698-05e03152ad9d', 'button', NULL, NULL, NULL, NULL, '6628e05a-876b-4fa1-80df-95f8becf5f7a', NULL, 'administrative:jobs-management:delete', NULL, NULL, NULL, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2022-10-27 16:50:34', '2022-10-27 16:50:34');
INSERT INTO `xmw_menu` VALUES ('3787908c-3fcc-415f-83a9-a9f3701269ef', '47eba309-b9b8-4943-9e6c-cf2296e41214', 'button', NULL, NULL, NULL, NULL, '6628e05a-876b-4fa1-80df-95f8becf5f7a', NULL, 'administrative:jobs-management:add', NULL, NULL, NULL, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2022-10-27 16:50:49', '2022-10-27 16:50:49');
INSERT INTO `xmw_menu` VALUES ('40861c40-fa06-4675-bfc7-f9fd2f7d175f', '0960fd86-7e79-496b-83aa-c4159e516d8c', 'menu', '/administrative', NULL, NULL, '/administrative/organization', 'ce451a62-2ac4-44de-8202-cd8b0a702840', '_blank', NULL, 'side', 'light', 'light', 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 88, 1, '2022-10-27 16:31:29', '2022-10-27 16:31:40');
INSERT INTO `xmw_menu` VALUES ('59a27556-69e9-4ecf-879f-fdd943fd190c', '630b29a5-77d0-4c50-867c-226227ce6fd5', 'button', NULL, NULL, NULL, NULL, 'dd8304e6-09e5-4fa8-8e56-bbefd4e69c0c', NULL, 'administrative:organization:add-child', NULL, NULL, NULL, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2022-10-27 16:35:24', '2022-10-27 16:35:24');
INSERT INTO `xmw_menu` VALUES ('6628e05a-876b-4fa1-80df-95f8becf5f7a', '9d8cdcd5-2151-43fe-8230-3ae610a9b3e3', 'menu', '/administrative/jobs-management', 'ri:contacts-book-3-line', './Aministrative/JobsManagement', NULL, 'ce451a62-2ac4-44de-8202-cd8b0a702840', '_blank', 'administrative:jobs-management', 'top', 'dark', 'dark', 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 66, 1, '2022-10-27 16:48:37', '2024-07-04 15:39:37');
INSERT INTO `xmw_menu` VALUES ('81d6e4a1-68e5-4b4e-bf3b-851a7adc2e03', '85eb76fb-5f11-45cb-85b5-ef8afa2ccf15', 'button', NULL, NULL, NULL, NULL, '6628e05a-876b-4fa1-80df-95f8becf5f7a', NULL, 'administrative:jobs-management:add-child', NULL, NULL, NULL, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2022-10-27 16:49:25', '2022-10-27 16:49:25');
INSERT INTO `xmw_menu` VALUES ('96c2072e-54bd-4d49-a335-ec8a4b3efa7d', '3f2d1b6c-85df-488b-b3b4-e537d523d124', 'button', NULL, NULL, NULL, NULL, 'b5c00c90-c7dc-4c9a-aa10-85e8c1959f8a', NULL, 'administrative:announcement:add', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, NULL, NULL, NULL, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2023-08-28 09:40:34', '2023-08-28 17:34:35');
INSERT INTO `xmw_menu` VALUES ('981f9c37-8775-458a-983f-23e775eae472', '92e1670f-3d65-49a3-8b65-cffe529ad03e', 'button', NULL, NULL, NULL, NULL, '6628e05a-876b-4fa1-80df-95f8becf5f7a', NULL, 'administrative:jobs-management:edit', NULL, NULL, NULL, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2022-10-27 16:50:16', '2022-10-27 16:50:16');
INSERT INTO `xmw_menu` VALUES ('b5c00c90-c7dc-4c9a-aa10-85e8c1959f8a', 'f1a1c4f7-9122-42a6-a5f2-84ce59f37807', 'menu', '/administrative/announcement', 'ri:notification-line', './Administrative/Announcement', NULL, 'ce451a62-2ac4-44de-8202-cd8b0a702840', '_blank', 'administrative:announcement', 'side', 'light', 'light', 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 86, 1, '2023-08-28 09:35:36', '2024-07-04 15:28:45');
INSERT INTO `xmw_menu` VALUES ('bf2dc72c-c524-4be3-a1cf-1da2bd853444', 'e11d0e19-da4e-453f-bb1b-8303f1874deb', 'button', NULL, NULL, NULL, NULL, 'b5c00c90-c7dc-4c9a-aa10-85e8c1959f8a', NULL, 'administrative:announcement:edit', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, NULL, NULL, NULL, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2023-08-28 09:40:47', '2023-08-28 09:40:47');
INSERT INTO `xmw_menu` VALUES ('ce451a62-2ac4-44de-8202-cd8b0a702840', '0960fd86-7e79-496b-83aa-c4159e516d8c', 'dir', '/administrative', 'ri:quill-pen-line', NULL, NULL, NULL, NULL, 'administrative', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, 1, NULL, NULL, NULL, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 88, 1, '2022-10-27 16:30:36', '2024-07-04 15:32:07');
INSERT INTO `xmw_menu` VALUES ('d518e1bd-7440-4e15-b509-23353aec3205', 'f9e5a8db-da13-435f-a0e8-2bf9da2695c9', 'button', NULL, NULL, NULL, NULL, 'dd8304e6-09e5-4fa8-8e56-bbefd4e69c0c', NULL, 'administrative:organization:delete', NULL, NULL, NULL, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2022-10-27 16:37:34', '2022-10-27 16:37:34');
INSERT INTO `xmw_menu` VALUES ('d6cdf288-0d59-4da8-a270-a5a49006154b', 'a54c782b-b087-4aa1-a56e-7fc4aec746a9', 'button', NULL, NULL, NULL, NULL, 'dd8304e6-09e5-4fa8-8e56-bbefd4e69c0c', NULL, 'administrative:organization:edit', NULL, NULL, NULL, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 1, 1, '2022-10-27 16:35:54', '2022-10-27 16:35:54');
INSERT INTO `xmw_menu` VALUES ('dd8304e6-09e5-4fa8-8e56-bbefd4e69c0c', 'fdaf8a23-8777-46ff-9142-f30eb3e4d8ee', 'menu', '/administrative/organization', 'ri:exchange-2-line', './Administrative/Organization', NULL, 'ce451a62-2ac4-44de-8202-cd8b0a702840', '_blank', 'administrative:organization', 'mix', 'dark', 'dark', 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 'bf75a509-f90e-4a29-8bf7-470b581550f6', 77, 1, '2022-10-27 16:33:12', '2024-07-04 15:39:23');

SET FOREIGN_KEY_CHECKS = 1;
