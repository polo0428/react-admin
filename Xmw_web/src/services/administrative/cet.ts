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

export interface SaveScoreParams {
  id?: string;
  name: string;
  student_no: string;
  department?: string;
  major?: string;
  class_name?: string;
  batch_id: string;
  exam_level: string;
  ticket_number: string;
  listening_score: number;
  reading_score: number;
  writing_score: number;
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
 * @description: 获取成绩分析
 * @param {batch_id: string} options
 */
export const getScoreAnalysis = (options: { batch_id: string }) =>
  httpRequest.get<any>(`${baseURL}/score/analysis`, options);
