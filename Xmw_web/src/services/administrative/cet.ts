import { PageResponse } from '@/utils/types';
import { httpRequest } from '@/utils/umiRequest';

const baseURL = '/administrative/cet';

export interface SaveCetParams {
  id?: string;
  year: string;
  semester: string;
  name: string;
  exam_date: string;
  status: string;
  describe?: string;
}

export interface CetListParams {
  name?: string;
  status?: string;
  current?: number;
  pageSize?: number;
}

/**
 * @description: 获取考次列表
 * @param {CetListParams} options
 */
export const getCetList = (options?: CetListParams) =>
  httpRequest.get<PageResponse<any>>(`${baseURL}`, options);

/**
 * @description: 保存考次
 * @param {SaveCetParams} options
 */
export const saveCet = (options: SaveCetParams) =>
  httpRequest.post<any>(`${baseURL}/save`, options);

/**
 * @description: 删除考次
 * @param {string} id
 */
export const deleteCet = (id: string) => httpRequest.delete<number>(`${baseURL}/${id}`);

/**
 * @description: 导入报名数据
 * @param {FormData} data
 */
export const importCetRegistration = (data: FormData) =>
  httpRequest.post<any>(`${baseURL}/import-registration`, data);

/**
 * @description: 导入成绩数据
 * @param {FormData} data
 */
export const importCetScore = (data: FormData) =>
  httpRequest.post<any>(`${baseURL}/import-score`, data);

export interface SaveScoreParams {
  id?: string;
  name: string;
  // 新模板：学号不再强制，允许为空
  student_no?: string;
  // 新模板：证件号码
  id_card?: string;
  // 新模板：年级
  grade?: string;
  department?: string;
  major?: string;
  class_name?: string;
  // 新模板：教学班/学员大队/学员队/学员类型
  teaching_class?: string;
  brigade?: string;
  squadron?: string;
  student_type?: string;
  batch_id: string;
  exam_level: string;
  // 新模板：准考证号允许为空
  ticket_number?: string;
  // 分项成绩不再必填（但后端仍支持）
  listening_score?: number;
  reading_score?: number;
  writing_score?: number;
  // 新模板：总分直接录入
  total_score?: number;
  campus?: string;
}

export interface ScoreListParams {
  batch_id?: string;
  keyword?: string;
  exam_level?: string;
  current?: number;
  pageSize?: number;
}

/**
 * @description: 获取成绩列表
 * @param {ScoreListParams} options
 */
export const getScoreList = (options?: ScoreListParams) =>
  httpRequest.get<PageResponse<any>>(`${baseURL}/score`, options);

/**
 * @description: 保存成绩
 * @param {SaveScoreParams} options
 */
export const saveScore = (options: SaveScoreParams) =>
  httpRequest.post<any>(`${baseURL}/score/save`, options);

/**
 * @description: 删除成绩
 * @param {string} id
 */
export const deleteScore = (id: string) => httpRequest.delete<number>(`${baseURL}/score/${id}`);

export interface RegistrationListParams {
  batch_id?: string;
  keyword?: string;
  exam_level?: string;
  current?: number;
  pageSize?: number;
}

export interface SaveRegistrationParams {
  id?: string;
  batch_id: string;
  name: string;
  id_card?: string;
  student_no?: string;
  grade?: string;
  major?: string;
  teaching_class?: string;
  brigade?: string;
  squadron?: string;
  student_type?: string;
  exam_level?: string;
  department?: string;
  class_name?: string;
  ticket_number?: string;
  campus?: string;
}

/**
 * @description: 获取报名列表
 */
export const getRegistrationList = (options?: RegistrationListParams) =>
  httpRequest.get<PageResponse<any>>(`${baseURL}/registration`, options);

/**
 * @description: 保存报名信息
 */
export const saveRegistration = (options: SaveRegistrationParams) =>
  httpRequest.post<any>(`${baseURL}/registration/save`, options);

/**
 * @description: 删除报名
 */
export const deleteRegistration = (id: string) =>
  httpRequest.delete<number>(`${baseURL}/registration/${id}`);

/**
 * @description: 获取成绩分析
 * @param {batch_id: string} options
 */
export const getScoreAnalysis = (options: { batch_id: string }) =>
  httpRequest.get<any>(`${baseURL}/score/analysis`, options);

/**
 * @description: 获取仪表盘分析数据
 * @param {batch_id: string} options
 */
export const getAnalysisDashboard = (options: { batch_id: string }) =>
  httpRequest.get<any>(`${baseURL}/analysis/dashboard`, options);

/**
 * @description: 获取所有班级成绩聚合数据
 */
export const getAllClassScores = () =>
  httpRequest.get<any[]>(`${baseURL}/score/all-classes`);
