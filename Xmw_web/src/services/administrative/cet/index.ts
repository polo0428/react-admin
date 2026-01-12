import { httpRequest } from '@/utils/umiRequest';

const baseURL = '/administrative/cet';

/**
 * @description: 获取CET考试列表
 */
export const getCetList = (options?: any) =>
  httpRequest.get<{ list: API.CET[]; total: number }>(`${baseURL}`, options);

/**
 * @description: 创建CET考试
 */
export const createCet = (options: any) => httpRequest.post(`${baseURL}`, options);

/**
 * @description: 更新CET考试
 */
export const updateCet = ({ id, ...options }: any) => httpRequest.put(`${baseURL}/${id}`, options);

/**
 * @description: 删除CET考试
 */
export const deleteCet = (id: string) => httpRequest.delete(`${baseURL}/${id}`);
