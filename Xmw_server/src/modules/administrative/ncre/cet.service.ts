import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { WhereOptions } from 'sequelize/types';
import { Sequelize } from 'sequelize-typescript';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const XLSX = require('xlsx');

import { XmwNcre } from '@/models/xmw_ncre.model';
import { XmwNcreRegistration } from '@/models/xmw_ncre_registration.model';
import { XmwNcreScore } from '@/models/xmw_ncre_score.model';
import { responseMessage } from '@/utils';
import { PageResponse, Response, SessionTypes } from '@/utils/types';

import {
  GetAnalysisDto,
  ListCetDto,
  ListRegistrationDto,
  ListScoreDto,
  SaveCetDto,
  SaveRegistrationDto,
  SaveScoreDto,
  ScoreAnalysisDto,
} from './dto';

const fixMojibake = (input: string) => {
  if (!input) return input;
  // 已经是中文就不处理
  if (/[\u4e00-\u9fff]/.test(input)) return input;
  // 乱码通常会包含 latin1 扩展字符或控制字符（如：ç­çº§ / å§å）
  if (!/[\u0080-\u00ff]/.test(input)) return input;
  try {
    const decoded = Buffer.from(input, 'latin1').toString('utf8');
    // 反解后出现中文，认为修复成功
    return /[\u4e00-\u9fff]/.test(decoded) ? decoded : input;
  } catch {
    return input;
  }
};

@Injectable()
export class CetService {
  constructor(
    @InjectModel(XmwNcre)
    private readonly cetModel: typeof XmwNcre,
    @InjectModel(XmwNcreScore)
    private readonly scoreModel: typeof XmwNcreScore,
    @InjectModel(XmwNcreRegistration)
    private readonly registrationModel: typeof XmwNcreRegistration,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * @description: 获取考次列表
   * @author: 黄鹏
   */
  async getCetList(
    cetInfo: ListCetDto,
  ): Promise<Response<PageResponse<XmwNcre>>> {
    const { name, status, pageSize = 20, current = 1 } = cetInfo;
    const where: WhereOptions = {};
    if (name) where.name = { [Op.substring]: name };
    if (status) where.status = { [Op.eq]: status };

    const total = await this.cetModel.count({ where });
    const result = await this.cetModel.findAll({
      offset: (Number(current) - 1) * pageSize,
      limit: Number(pageSize),
      where,
      order: [
        ['exam_date', 'DESC'], // 按考试日期倒序
        ['created_time', 'DESC'],
      ],
      raw: true,
    });
    return responseMessage({ list: result, total });
  }

  /**
   * @description: 保存考次
   * @author: 黄鹏
   */
  async saveCet(
    { id, ...cetInfo }: SaveCetDto,
    session?: SessionTypes,
  ): Promise<Response<SaveCetDto>> {
    const founder = session?.currentUserInfo?.user_id || null;
    let result;
    if (id) {
      result = await this.cetModel.update(cetInfo, { where: { id } });
    } else {
      result = await this.cetModel.create({ ...cetInfo, founder });
    }
    return responseMessage(result);
  }

  /**
   * @description: 删除考次
   * @author: 黄鹏
   */
  async deleteCet(id: string): Promise<Response<number>> {
    const result = await this.cetModel.destroy({ where: { id } });
    return responseMessage(result);
  }

  /**
   * @description: 删除成绩
   * @author: 黄鹏
   */
  async deleteScore(id: string): Promise<Response<number>> {
    const result = await this.scoreModel.destroy({ where: { id } });
    return responseMessage(result);
  }

  /**
   * @description: 删除报名
   */
  async deleteRegistration(id: string): Promise<Response<number>> {
    const result = await this.registrationModel.destroy({ where: { id } });
    return responseMessage(result);
  }

  /**
   * @description: 获取成绩列表
   * @author: 黄鹏
   */
  async getScoreList(
    scoreInfo: ListScoreDto,
  ): Promise<Response<PageResponse<XmwNcreScore>>> {
    const {
      batch_id,
      keyword,
      exam_level,
      pageSize = 20,
      current = 1,
    } = scoreInfo;
    const where: any = {};
    const andWhere: WhereOptions[] = [];

    if (batch_id) where.batch_id = { [Op.eq]: batch_id };
    // 兼容 exam_level 中存储 “级别|科目” 的情况：按包含匹配来筛选级别
    if (exam_level) where.exam_level = { [Op.substring]: exam_level };

    if (keyword) {
      andWhere.push({
        [Op.or]: [
          { name: { [Op.substring]: keyword } },
          { student_no: { [Op.substring]: keyword } },
        ],
      });
    }

    if (andWhere.length > 0) {
      where[Op.and] = andWhere;
    }

    const total = await this.scoreModel.count({ where });
    const result = await this.scoreModel.findAll({
      offset: (Number(current) - 1) * pageSize,
      limit: Number(pageSize),
      where,
      order: [['created_time', 'DESC']],
      raw: true,
    });
    const fixStr = (v: any) =>
      v === undefined || v === null ? v : fixMojibake(String(v));
    const fixed = (result as any[]).map((r) => ({
      ...r,
      name: fixStr(r.name),
      department: fixStr(r.department),
      major: fixStr(r.major),
      class_name: fixStr(r.class_name),
      exam_level: fixStr(r.exam_level),
      campus: fixStr(r.campus),
    }));
    return responseMessage({ list: fixed, total });
  }

  /**
   * @description: 获取报名列表
   */
  async getRegistrationList(
    regInfo: ListRegistrationDto,
  ): Promise<Response<PageResponse<XmwNcreRegistration>>> {
    const {
      batch_id,
      keyword,
      exam_level,
      pageSize = 20,
      current = 1,
    } = regInfo;

    const where: any = {};
    const andWhere: WhereOptions[] = [];

    if (batch_id) where.batch_id = { [Op.eq]: batch_id };
    // 兼容 exam_level 中存储 “级别|科目” 的情况：按包含匹配来筛选级别
    if (exam_level) where.exam_level = { [Op.substring]: exam_level };

    if (keyword) {
      andWhere.push({
        [Op.or]: [
          { name: { [Op.substring]: keyword } },
          { student_no: { [Op.substring]: keyword } },
        ],
      });
    }

    if (andWhere.length > 0) {
      where[Op.and] = andWhere;
    }

    const total = await this.registrationModel.count({ where });
    const result = await this.registrationModel.findAll({
      offset: (Number(current) - 1) * pageSize,
      limit: Number(pageSize),
      where,
      order: [['created_time', 'DESC']],
      raw: true,
    });

    const fixStr = (v: any) =>
      v === undefined || v === null ? v : fixMojibake(String(v));
    const fixed = (result as any[]).map((r) => ({
      ...r,
      name: fixStr(r.name),
      department: fixStr(r.department),
      major: fixStr(r.major),
      class_name: fixStr(r.class_name),
      exam_level: fixStr(r.exam_level),
      campus: fixStr(r.campus),
    }));

    return responseMessage({ list: fixed, total });
  }

  /**
   * @description: 保存报名信息
   */
  async saveRegistration(
    regInfo: SaveRegistrationDto,
  ): Promise<Response<XmwNcreRegistration>> {
    const { id, ...data } = regInfo;
    let result;
    if (id) {
      result = await this.registrationModel.update(data, { where: { id } });
    } else {
      result = await this.registrationModel.create(data);
    }
    return responseMessage(result);
  }

  /**
   * @description: 保存成绩
   * @author: 黄鹏
   */
  async saveScore(scoreInfo: SaveScoreDto): Promise<Response<XmwNcreScore>> {
    const { id, listening_score, reading_score, writing_score, ...rest } =
      scoreInfo;
    const total_score = listening_score + reading_score + writing_score;
    // NCRE 总分 100，及格线一般为 60（前端录入同样按 60 判定）
    const is_passed = total_score >= 60;
    const data = {
      ...rest,
      listening_score,
      reading_score,
      writing_score,
      total_score,
      is_passed,
    };

    let result;
    if (id) {
      result = await this.scoreModel.update(data, { where: { id } });
    } else {
      result = await this.scoreModel.create(data);
    }
    return responseMessage(result);
  }

  /**
   * @description: 导入报名数据
   */
  async importRegistration(
    file: Express.Multer.File,
    batch_id: string,
  ): Promise<Response<any>> {
    if (!file) {
      return responseMessage(null, '请上传文件', -1);
    }
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 用 header:1 读取二维数组，避免表头空格/换行/合并单元格/编码问题导致键名异常
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false,
      }) as any[][];

      const normalizeKey = (v: any) =>
        fixMojibake(String(v ?? ''))
          .replace(/[\r\n\t]/g, '')
          .replace(/\u00a0/g, ' ') // nbsp
          .replace(/\s+/g, '') // 去掉所有空白
          // 去掉常见标点/括号/斜杠等，避免“班级(行政班)”/“写作/翻译”之类匹配不到
          .replace(/[^a-z0-9\u4e00-\u9fff]/gi, '')
          .trim()
          .toLowerCase();

      const headerAliases = [
        '姓名',
        '学号',
        '学生学号',
        '学院',
        '专业',
        '班级',
        '报考级别',
        '报考等级',
        '考试等级',
        '准考证号',
        '准考证号码',
        '准考证',
        '校区',
      ].map((k) => normalizeKey(k));

      const isRowEmpty = (r: any[]) =>
        !r || r.every((c) => normalizeKey(c) === '');

      const findHeaderRowIndex = (rs: any[][], maxScan = 10) => {
        const limit = Math.min(rs.length, maxScan);
        let bestIdx = 0;
        let bestScore = -1;
        for (let i = 0; i < limit; i += 1) {
          const r = rs[i] || [];
          if (isRowEmpty(r)) continue;
          const score = r.reduce((acc, cell) => {
            const k = normalizeKey(cell);
            return acc + (k && headerAliases.includes(k) ? 1 : 0);
          }, 0);
          if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }
        // 至少命中 2 个关键表头才认为是有效表头行
        return bestScore >= 2 ? bestIdx : 0;
      };

      const headerRowIndex = findHeaderRowIndex(rows);
      const headerRow = rows?.[headerRowIndex] || [];
      const headerKeys = headerRow.map((h) => normalizeKey(h)).filter(Boolean);

      const dataRows = rows
        .slice(headerRowIndex + 1)
        .filter((r) => !isRowEmpty(r));

      const toStr = (v: any) =>
        v === undefined || v === null ? '' : fixMojibake(String(v).trim());

      const getByAliases = (row: Record<string, any>, aliases: string[]) => {
        for (const a of aliases) {
          const v = row[normalizeKey(a)];
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            return v;
          }
        }
        return undefined;
      };

      const parsed = (dataRows as any[])
        .map((arrRow) => {
          const row: Record<string, any> = {};
          for (let i = 0; i < headerRow.length; i += 1) {
            const k = normalizeKey(headerRow[i]);
            if (!k) continue;
            if (row[k] === undefined || row[k] === '') {
              row[k] = arrRow?.[i];
            }
          }

          return {
            batch_id,
            name: toStr(getByAliases(row, ['姓名', 'name'])),
            student_no: toStr(
              getByAliases(row, ['学号', '学生学号', 'student_no']),
            ),
            department: toStr(getByAliases(row, ['学院', 'department'])),
            major: toStr(getByAliases(row, ['专业', 'major'])),
            class_name: toStr(
              getByAliases(row, [
                '班级',
                '班级名称',
                '班级编号',
                '班级代码',
                '班级id',
                '班级号',
                '班号',
                '行政班',
                '行政班级',
                '所在班级',
                'class_name',
              ]),
            ),
            exam_level: toStr(
              getByAliases(row, [
                '报考级别',
                '报考等级',
                '考试等级',
                'exam_level',
              ]),
            ),
            ticket_number: toStr(
              getByAliases(row, [
                '准考证号',
                '准考证号码',
                '准考证',
                'ticket_number',
              ]),
            ),
            campus: toStr(getByAliases(row, ['校区', 'campus'])),
          };
        })
        .filter((r) => r.name && r.student_no);

      if (parsed.length === 0) {
        return responseMessage(
          null,
          `未解析到有效数据，请检查必填项（表头行：${
            headerRowIndex + 1
          }，已识别表头：${headerKeys.join(',')}）`,
          -1,
        );
      }

      const ticketNumbers = Array.from(
        new Set(parsed.map((r) => r.ticket_number).filter(Boolean)),
      );
      const studentNos = Array.from(
        new Set(parsed.map((r) => r.student_no).filter(Boolean)),
      );

      const existing = await this.registrationModel.findAll({
        where: {
          batch_id,
          [Op.or]: [
            ticketNumbers.length
              ? { ticket_number: { [Op.in]: ticketNumbers } }
              : undefined,
            studentNos.length
              ? { student_no: { [Op.in]: studentNos } }
              : undefined,
          ].filter(Boolean) as any,
        },
        raw: true,
      });

      const byTicket = new Map(
        existing
          .filter((e) => e.ticket_number)
          .map((e) => [e.ticket_number, e]),
      );
      const byStudentNo = new Map(
        existing.filter((e) => e.student_no).map((e) => [e.student_no, e]),
      );

      const toCreate: any[] = [];
      const toUpdate: { where: any; data: any }[] = [];
      let skipped = 0;

      for (const r of parsed) {
        const match =
          (r.ticket_number && byTicket.get(r.ticket_number)) ||
          (r.student_no && byStudentNo.get(r.student_no));

        if (match) {
          const data: any = {};
          if (r.name) data.name = r.name;
          if (r.student_no) data.student_no = r.student_no;
          if (r.department) data.department = r.department;
          if (r.major) data.major = r.major;
          if (r.class_name) data.class_name = r.class_name;
          if (r.exam_level) data.exam_level = r.exam_level;
          if (r.ticket_number) data.ticket_number = r.ticket_number;
          if (r.campus) data.campus = r.campus;
          toUpdate.push({
            where: { id: match.id },
            data,
          });
          continue;
        }

        if (r.name && r.student_no) {
          toCreate.push(r);
        } else {
          skipped += 1;
        }
      }

      const result = await this.sequelize.transaction(async (t) => {
        let updated = 0;
        for (const u of toUpdate) {
          const [affected] = await this.registrationModel.update(u.data, {
            where: u.where,
            transaction: t,
          });
          updated += affected;
        }
        const createdList = toCreate.length
          ? await this.registrationModel.bulkCreate(toCreate, {
              transaction: t,
            })
          : [];
        return { updated, created: createdList.length };
      });

      return responseMessage({
        total: parsed.length,
        ...result,
        skipped,
        meta: {
          headerRow: headerRowIndex + 1,
          headers: headerKeys,
          classFilled: parsed.filter((r) => r.class_name).length,
        },
      });
    } catch (error) {
      console.error('Import Error:', error);
      return responseMessage(null, '导入失败，请检查文件格式', -1);
    }
  }

  /**
   * @description: 导入成绩数据
   */
  async importScore(
    file: Express.Multer.File,
    batch_id: string,
  ): Promise<Response<any>> {
    if (!file) {
      return responseMessage(null, '请上传文件', -1);
    }
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 用 header:1 先拿到“原始二维数组”，避免表头空格/换行/合并单元格导致键名异常
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false,
      }) as any[][];

      const normalizeKey = (v: any) =>
        fixMojibake(String(v ?? ''))
          .replace(/[\r\n\t]/g, '')
          .replace(/\u00a0/g, ' ') // nbsp
          .replace(/\s+/g, '') // 去掉所有空白
          // 去掉常见标点/括号/斜杠等，避免“班级(行政班)”/“写作/翻译”之类匹配不到
          .replace(/[^a-z0-9\u4e00-\u9fff]/gi, '')
          .trim()
          .toLowerCase();

      // 自动探测表头所在行：避免第一行是标题/空行/合并单元格
      const headerAliases = [
        '姓名',
        '学号',
        '学生学号',
        '学院',
        '专业',
        '班级',
        '报考级别',
        '报考等级',
        '考试等级',
        '准考证号',
        '准考证号码',
        '准考证',
        '听力',
        '阅读',
        '写作与翻译',
        '写作与翻译总分',
        '写作/翻译',
        '总分',
      ].map((k) => normalizeKey(k));

      const isRowEmpty = (r: any[]) =>
        !r || r.every((c) => normalizeKey(c) === '');

      const findHeaderRowIndex = (rs: any[][], maxScan = 10) => {
        const limit = Math.min(rs.length, maxScan);
        let bestIdx = 0;
        let bestScore = -1;
        for (let i = 0; i < limit; i += 1) {
          const r = rs[i] || [];
          if (isRowEmpty(r)) continue;
          const score = r.reduce((acc, cell) => {
            const k = normalizeKey(cell);
            return acc + (k && headerAliases.includes(k) ? 1 : 0);
          }, 0);
          if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }
        // 至少命中 2 个关键表头才认为是有效表头行
        return bestScore >= 2 ? bestIdx : 0;
      };

      const headerRowIndex = findHeaderRowIndex(rows);
      const headerRow = rows?.[headerRowIndex] || [];
      const headerKeys = headerRow.map((h) => normalizeKey(h)).filter(Boolean);

      const pickVal = (row: Record<string, any>, keys: string[]) => {
        for (const k of keys) {
          const v = row?.[normalizeKey(k)];
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            return v;
          }
        }
        return undefined;
      };
      const toStr = (v: any) =>
        v === undefined || v === null ? '' : fixMojibake(String(v).trim());
      const toNum = (v: any) => {
        const n = Number(String(v ?? '').trim());
        return Number.isFinite(n) ? n : 0;
      };

      const dataRows = rows
        .slice(headerRowIndex + 1)
        .filter((r) => !isRowEmpty(r));
      const parsed = (dataRows as any[])
        .map((arrRow) => {
          const row: Record<string, any> = {};
          for (let i = 0; i < headerRow.length; i += 1) {
            const k = normalizeKey(headerRow[i]);
            if (!k) continue;
            if (row[k] === undefined || row[k] === '') {
              row[k] = arrRow?.[i];
            }
          }

          const name = toStr(pickVal(row, ['姓名', 'name']));
          const student_no = toStr(
            pickVal(row, ['学号', '学生学号', 'student_no']),
          );
          const department = toStr(pickVal(row, ['学院', 'department']));
          const major = toStr(pickVal(row, ['专业', 'major']));
          const class_name = toStr(
            pickVal(row, [
              '班级',
              '班级名称',
              '班级编号',
              '班级代码',
              '班级id',
              '班级号',
              '班号',
              '行政班',
              '行政班级',
              '所在班级',
              'class_name',
            ]),
          );
          const campus = toStr(pickVal(row, ['校区', 'campus']));
          const exam_level = toStr(
            pickVal(row, ['报考级别', '报考等级', '考试等级', 'exam_level']),
          );
          const ticket_number = toStr(
            pickVal(row, ['准考证号', '准考证号码', '准考证', 'ticket_number']),
          );

          const listening_score = toNum(
            pickVal(row, ['听力', 'listening_score']),
          );
          const reading_score = toNum(pickVal(row, ['阅读', 'reading_score']));
          const writing_score = toNum(
            pickVal(row, [
              '写作与翻译',
              '写作与翻译总分',
              '写作/翻译',
              '写作',
              'writing_score',
            ]),
          );

          return {
            batch_id,
            name,
            student_no,
            department,
            major,
            class_name,
            campus,
            exam_level,
            ticket_number,
            listening_score,
            reading_score,
            writing_score,
            total_score: listening_score + reading_score + writing_score,
            // NCRE 总分 100，及格线一般为 60
            is_passed: listening_score + reading_score + writing_score >= 60,
          };
        })
        // 至少要能定位到某个考生：准考证号/学号 其一
        .filter((r) => r.ticket_number || r.student_no);

      if (parsed.length === 0) {
        return responseMessage(
          null,
          `未解析到有效数据，请检查表头与必填项（表头行：${
            headerRowIndex + 1
          }，已识别表头：${headerKeys.join(',')}）`,
          -1,
        );
      }

      const ticketNumbers = Array.from(
        new Set(parsed.map((r) => r.ticket_number).filter(Boolean)),
      );
      const studentNos = Array.from(
        new Set(parsed.map((r) => r.student_no).filter(Boolean)),
      );

      const existing = await this.scoreModel.findAll({
        where: {
          batch_id,
          [Op.or]: [
            ticketNumbers.length
              ? { ticket_number: { [Op.in]: ticketNumbers } }
              : undefined,
            studentNos.length
              ? { student_no: { [Op.in]: studentNos } }
              : undefined,
          ].filter(Boolean) as any,
        },
        raw: true,
      });

      const byTicket = new Map(
        existing
          .filter((e) => e.ticket_number)
          .map((e) => [e.ticket_number, e]),
      );
      const byStudentNo = new Map(
        existing.filter((e) => e.student_no).map((e) => [e.student_no, e]),
      );

      const toCreate: any[] = [];
      const toUpdate: { where: any; data: any }[] = [];
      let skipped = 0;

      for (const r of parsed) {
        const match =
          (r.ticket_number && byTicket.get(r.ticket_number)) ||
          (r.student_no && byStudentNo.get(r.student_no));

        if (match) {
          const baseInfo: any = {};
          if (r.name) baseInfo.name = r.name;
          if (r.department) baseInfo.department = r.department;
          if (r.major) baseInfo.major = r.major;
          if (r.class_name) baseInfo.class_name = r.class_name;
          if (r.campus) baseInfo.campus = r.campus;
          if (r.exam_level) baseInfo.exam_level = r.exam_level;
          if (r.ticket_number) baseInfo.ticket_number = r.ticket_number;
          if (r.student_no) baseInfo.student_no = r.student_no;

          toUpdate.push({
            where: { id: match.id },
            data: {
              ...baseInfo,
              listening_score: r.listening_score,
              reading_score: r.reading_score,
              writing_score: r.writing_score,
              total_score: r.total_score,
              is_passed: r.is_passed,
            },
          });
          continue;
        }

        // 新增时需要满足数据库必填：name/student_no/batch_id/exam_level/ticket_number
        if (r.name && r.student_no && r.exam_level && r.ticket_number) {
          toCreate.push(r);
        } else {
          skipped += 1;
        }
      }

      const result = await this.sequelize.transaction(async (t) => {
        let updated = 0;
        for (const u of toUpdate) {
          const [affected] = await this.scoreModel.update(u.data, {
            where: u.where,
            transaction: t,
          });
          updated += affected;
        }
        const createdList = toCreate.length
          ? await this.scoreModel.bulkCreate(toCreate, { transaction: t })
          : [];
        return { updated, created: createdList.length };
      });

      return responseMessage({
        total: parsed.length,
        ...result,
        skipped,
      });
    } catch (error) {
      console.error('Import Score Error:', error);
      return responseMessage(null, '导入成绩失败', -1);
    }
  }

  /**
   * @description: 获取成绩分析数据
   * @author: 黄鹏
   */
  async getScoreAnalysis(
    analysisInfo: ScoreAnalysisDto,
  ): Promise<Response<any>> {
    const { batch_id } = analysisInfo;
    const where: WhereOptions = { batch_id };

    const total = await this.scoreModel.count({ where });
    if (total === 0) {
      return responseMessage({
        total: 0,
        passed: 0,
        passRate: '0.0',
        avgScore: 0,
        maxScore: 0,
      });
    }

    const passed = await this.scoreModel.count({
      where: { ...where, is_passed: true },
    });

    // 计算平均分和最高分
    const scores = await this.scoreModel.findAll({
      attributes: ['total_score'],
      where,
      raw: true,
    });

    const totalScoreSum = scores.reduce((sum, s) => sum + s.total_score, 0);
    const avgScore = Math.round(totalScoreSum / total);
    const maxScore = Math.max(...scores.map((s) => s.total_score));
    const passRate = ((passed / total) * 100).toFixed(1);

    return responseMessage({
      total,
      passed,
      passRate,
      avgScore,
      maxScore,
    });
  }

  /**
   * @description: 获取仪表盘分析数据
   * @author: 黄鹏
   */
  async getAnalysisDashboard(
    analysisInfo: GetAnalysisDto,
  ): Promise<Response<any>> {
    const { batch_id } = analysisInfo;

    // 1. 获取当前考次信息
    const currentBatch = await this.cetModel.findByPk(batch_id);
    if (!currentBatch) {
      return responseMessage(null, '考次不存在', -1);
    }

    // 2. 获取上一次考次信息 (按时间倒序的前一个)
    const previousBatch = await this.cetModel.findOne({
      where: {
        exam_date: { [Op.lt]: currentBatch.exam_date },
      },
      order: [['exam_date', 'DESC']],
    });

    // 3. 获取当前考次所有成绩
    const currentScores = await this.scoreModel.findAll({
      where: { batch_id },
      raw: true,
    });

    // 4. 获取上一次考次所有成绩
    let previousScores: XmwNcreScore[] = [];
    if (previousBatch) {
      previousScores = await this.scoreModel.findAll({
        where: { batch_id: previousBatch.id },
        raw: true,
      });
    }

    // --- 计算统计卡片数据 ---
    const totalCandidates = currentScores.length;
    const prevTotalCandidates = previousScores.length;

    // 计算同比增幅
    let totalCandidatesDiff = '-';
    if (prevTotalCandidates > 0) {
      const diff =
        ((totalCandidates - prevTotalCandidates) / prevTotalCandidates) * 100;
      totalCandidatesDiff = (diff > 0 ? '+' : '') + diff.toFixed(1) + '%';
    }
    const totalCandidatesYoY = totalCandidatesDiff;

    // 辅助函数：计算通过率
    const calcPassRate = (scores: XmwNcreScore[]) => {
      if (scores.length === 0) return 0;
      const passed = scores.filter((s) => s.total_score >= 60).length;
      return (passed / scores.length) * 100;
    };

    // 筛选 计算机二级/计算机三级
    // NCRE 级别通常存储为 "计算机二级" 或 "NCRE2" 等，需根据实际数据调整
    // 这里假设数据中存储的是中文 "计算机二级" 或含 "二级" 的字符串
    const isLevel2 = (s: XmwNcreScore) =>
      s.exam_level.includes('二级') || s.exam_level.includes('NCRE2');
    const isLevel3 = (s: XmwNcreScore) =>
      s.exam_level.includes('三级') || s.exam_level.includes('NCRE3');

    const level2Scores = currentScores.filter(isLevel2);
    const level3Scores = currentScores.filter(isLevel3);
    const prevLevel2Scores = previousScores.filter(isLevel2);
    const prevLevel3Scores = previousScores.filter(isLevel3);

    const level2PassRateVal = calcPassRate(level2Scores);
    const level3PassRateVal = calcPassRate(level3Scores);
    const prevLevel2PassRateVal = calcPassRate(prevLevel2Scores);
    const prevLevel3PassRateVal = calcPassRate(prevLevel3Scores);

    const level2Diff = level2PassRateVal - prevLevel2PassRateVal;
    const level3Diff = level3PassRateVal - prevLevel3PassRateVal;

    const level2PassRateYoY =
      (level2Diff >= 0 ? '+' : '') + level2Diff.toFixed(1) + '%';
    const level3PassRateYoY =
      (level3Diff >= 0 ? '+' : '') + level3Diff.toFixed(1) + '%';

    const avgScore =
      totalCandidates > 0
        ? Math.round(
            currentScores.reduce((a, b) => a + b.total_score, 0) /
              totalCandidates,
          )
        : 0;
    const maxScore =
      totalCandidates > 0
        ? Math.max(...currentScores.map((s) => s.total_score))
        : 0;

    // --- 趋势图 (Trend Chart) - 最近6次 ---
    const lastBatches = await this.cetModel.findAll({
      where: {
        exam_date: { [Op.lte]: currentBatch.exam_date },
      },
      order: [['exam_date', 'DESC']],
      limit: 6,
      raw: true,
    });

    const batchIds = lastBatches.map((b) => b.id);
    const allTrendScores = await this.scoreModel.findAll({
      where: { batch_id: { [Op.in]: batchIds } },
      attributes: ['batch_id', 'exam_level', 'total_score', 'is_passed'],
      raw: true,
    });

    const trendData = lastBatches.reverse().map((batch) => {
      const bScores = allTrendScores.filter((s) => s.batch_id === batch.id);
      const bLevel2 = bScores.filter(
        (s) => s.exam_level.includes('二级') || s.exam_level.includes('NCRE2'),
      );
      const bLevel3 = bScores.filter(
        (s) => s.exam_level.includes('三级') || s.exam_level.includes('NCRE3'),
      );
      return {
        batchName: batch.name,
        level2PassRate: parseFloat(calcPassRate(bLevel2).toFixed(1)),
        level3PassRate: parseFloat(calcPassRate(bLevel3).toFixed(1)),
      };
    });

    // --- 雷达图 (Radar Chart) ---
    const calcAvg = (scores: XmwNcreScore[], field: keyof XmwNcreScore) => {
      if (scores.length === 0) return 0;
      const sum = scores.reduce((acc, s) => acc + (Number(s[field]) || 0), 0);
      return Math.round(sum / scores.length);
    };

    const curListening = calcAvg(currentScores, 'listening_score');
    const curReading = calcAvg(currentScores, 'reading_score');
    const curWriting = calcAvg(currentScores, 'writing_score');

    const prevListening = calcAvg(previousScores, 'listening_score');
    const prevReading = calcAvg(previousScores, 'reading_score');
    const prevWriting = calcAvg(previousScores, 'writing_score');

    // NCRE 科目可能不同，这里暂用 理论/操作/其它 映射
    const radarData = [
      { subject: '理论/选择', A: curListening, B: prevListening },
      { subject: '操作/编程', A: curReading, B: prevReading },
      { subject: '其它', A: curWriting, B: prevWriting },
    ];

    // --- 分布图 (Distribution Chart) - 分别统计 二级 和 三级 ---
    // NCRE 总分100，分布段建议：<60, 60-80, 80-90, >90 (及格/良好/优秀)
    const getDistData = (scores: XmwNcreScore[]) => [
      {
        range: '<60',
        count: scores.filter((s) => s.total_score < 60).length,
      },
      {
        range: '60-80',
        count: scores.filter((s) => s.total_score >= 60 && s.total_score < 80)
          .length,
      },
      {
        range: '80-90',
        count: scores.filter(
          (s) => s.total_score >= 80 && s.total_score < 90,
        ).length,
      },
      {
        range: '90-100',
        count: scores.filter((s) => s.total_score >= 90).length,
      },
    ];

    const distData = getDistData(level2Scores);
    const level3DistData = getDistData(level3Scores);

    return responseMessage({
      totalCandidates,
      totalCandidatesYoY,
      level2PassRate: level2PassRateVal.toFixed(1) + '%',
      level2PassRateYoY,
      level3PassRate: level3PassRateVal.toFixed(1) + '%',
      level3PassRateYoY,
      avgScore,
      maxScore,
      trendData,
      radarData,
      distributionData: distData,
      level3DistributionData: level3DistData,
    });
  }

  /**
   * @description: 获取所有班级成绩聚合数据（NCRE）
   */
  async getAllClassScores(): Promise<Response<any>> {
    return this.getScoreGroups('class_name');
  }

  /**
   * @description: 按维度获取成绩聚合数据（NCRE）
   * @param groupBy class_name | major | department
   * @param level 可选：计算机一级/二级/三级/四级（按包含匹配，兼容 “级别|科目”）
   */
  async getScoreGroups(
    groupBy: string = 'class_name',
    level?: string,
  ): Promise<Response<any>> {
    const groupByKey = (groupBy || 'class_name').toLowerCase();

    // 1. 获取所有考次，按时间排序，用于确定成绩数组的索引顺序
    const batches = await this.cetModel.findAll({
      order: [['exam_date', 'ASC']],
      raw: true,
    });
    const batchIdToIndex = new Map<string, number>();
    batches.forEach((b: any, index: number) => batchIdToIndex.set(b.id, index));
    const totalBatches = batches.length;

    // 2. 获取成绩数据（可按 level 过滤）
    const where: WhereOptions = {};
    if (level) {
      (where as any).exam_level = { [Op.substring]: level };
    }
    const allScores = await this.scoreModel.findAll({ where, raw: true });

    // 3. 聚合：Group -> Student -> scores[]
    const groupMap = new Map<string, Map<string, any>>();
    const groupMetaMap = new Map<string, { maxBatchIndex: number }>();
    const ensureMeta = (groupName: string) => {
      if (!groupMetaMap.has(groupName)) {
        groupMetaMap.set(groupName, { maxBatchIndex: -1 });
      }
      return groupMetaMap.get(groupName)!;
    };

    const fixStr = (v: any) =>
      v === undefined || v === null ? v : fixMojibake(String(v));

    for (const score of allScores as any[]) {
      const groupName = (() => {
        switch (groupByKey) {
          case 'department':
            return fixStr(score.department) || '未填写学院';
          case 'major':
            return fixStr(score.major) || '未填写专业';
          case 'class_name':
          default:
            return fixStr(score.class_name) || '未填写班级';
        }
      })();

      const studentId = fixStr(score.student_no) || fixStr(score.name);
      const studentName = fixStr(score.name);

      if (!groupMap.has(groupName)) groupMap.set(groupName, new Map());
      const studentMap = groupMap.get(groupName)!;
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: studentName,
          groupId: groupName,
          scores: new Array(totalBatches).fill(0),
        });
      }
      const student = studentMap.get(studentId)!;
      const batchIndex = batchIdToIndex.get(score.batch_id);
      if (batchIndex === undefined) continue;

      const totalScore = Number(score.total_score) || 0;
      // 同一个考次可能存在“级别|科目”多条记录，这里取最大分
      student.scores[batchIndex] = Math.max(
        Number(student.scores[batchIndex]) || 0,
        totalScore,
      );
      if (totalScore > 0) {
        const meta = ensureMeta(groupName);
        meta.maxBatchIndex = Math.max(meta.maxBatchIndex, batchIndex);
      }
    }

    // 4. 转换为数组格式
    const result: any[] = [];
    for (const [groupName, studentMap] of groupMap) {
      const meta = groupMetaMap.get(groupName);
      const latestBatch =
        meta && meta.maxBatchIndex >= 0 ? (batches as any[])[meta.maxBatchIndex] : undefined;
      result.push({
        id: groupName,
        name: groupName,
        year: latestBatch?.year,
        semester: latestBatch?.semester,
        students: Array.from(studentMap.values()),
      });
    }

    return responseMessage(result);
  }
}
