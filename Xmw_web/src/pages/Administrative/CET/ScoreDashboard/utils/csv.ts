/**
 * @file CSV 导出工具
 * - 自动添加 BOM，解决 Excel 打开中文乱码
 * - 仅适用于简单字段（未做复杂 CSV 转义），后续如有逗号/换行字段可增强为严格转义
 */

export function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


