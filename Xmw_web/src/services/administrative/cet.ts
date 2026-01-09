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

/**
 * @description: 保存考次
 * @param {SaveCetParams} options
 */
export const saveCet = (options: SaveCetParams) =>
  httpRequest.post<any>(`${baseURL}/save`, options);
