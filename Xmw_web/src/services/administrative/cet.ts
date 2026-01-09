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
