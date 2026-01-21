import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import type { WhereOptions } from 'sequelize/types';
import { Sequelize } from 'sequelize-typescript';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const XLSX = require('xlsx');

import { XmwCet } from '@/models/xmw_cet.model';
import { XmwCetRegistration } from '@/models/xmw_cet_registration.model';
import { XmwCetScore } from '@/models/xmw_cet_score.model';
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
    @InjectModel(XmwCet)
    private readonly cetModel: typeof XmwCet,
    @InjectModel(XmwCetScore)
    private readonly scoreModel: typeof XmwCetScore,
    @InjectModel(XmwCetRegistration)
    private readonly registrationModel: typeof XmwCetRegistration,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * @description: 获取考次列表
   * @author: 黄鹏
   */
  async getCetList(
    cetInfo: ListCetDto,
  ): Promise<Response<PageResponse<XmwCet>>> {
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
    // 注意：xmw_cet_registration / xmw_cet_score 的 batch_id 外键引用 xmw_cet.id
    // 数据库未设置 ON DELETE CASCADE 时，需要先删除子表数据，否则会触发外键约束错误
    const result = await this.sequelize.transaction(async (t) => {
      await this.scoreModel.destroy({
        where: { batch_id: id },
        transaction: t,
      });
      await this.registrationModel.destroy({
        where: { batch_id: id },
        transaction: t,
      });
      return await this.cetModel.destroy({ where: { id }, transaction: t });
    });
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
  ): Promise<Response<PageResponse<XmwCetScore>>> {
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
    if (exam_level) where.exam_level = { [Op.eq]: exam_level };

    if (keyword) {
      andWhere.push({
        [Op.or]: [
          { name: { [Op.substring]: keyword } },
          // 兼容新旧模板：学号/证件号码/准考证号/教学班 任选其一可搜索到
          { student_no: { [Op.substring]: keyword } },
          { id_card: { [Op.substring]: keyword } },
          { ticket_number: { [Op.substring]: keyword } },
          { teaching_class: { [Op.substring]: keyword } },
          { brigade: { [Op.substring]: keyword } },
          { squadron: { [Op.substring]: keyword } },
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
      id_card: fixStr(r.id_card),
      grade: fixStr(r.grade),
      teaching_class: fixStr(r.teaching_class),
      brigade: fixStr(r.brigade),
      squadron: fixStr(r.squadron),
      student_type: fixStr(r.student_type),
    }));
    return responseMessage({ list: fixed, total });
  }

  /**
   * @description: 获取报名列表
   */
  async getRegistrationList(
    regInfo: ListRegistrationDto,
  ): Promise<Response<PageResponse<XmwCetRegistration>>> {
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
    if (exam_level) where.exam_level = { [Op.eq]: exam_level };

    if (keyword) {
      andWhere.push({
        [Op.or]: [
          { name: { [Op.substring]: keyword } },
          // 兼容新旧模板：学号/证件号码/准考证号 任选其一可搜索到
          { student_no: { [Op.substring]: keyword } },
          { id_card: { [Op.substring]: keyword } },
          { ticket_number: { [Op.substring]: keyword } },
          { teaching_class: { [Op.substring]: keyword } },
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
      id_card: fixStr(r.id_card),
      grade: fixStr(r.grade),
      teaching_class: fixStr(r.teaching_class),
      brigade: fixStr(r.brigade),
      squadron: fixStr(r.squadron),
      student_type: fixStr(r.student_type),
    }));

    return responseMessage({ list: fixed, total });
  }

  /**
   * @description: 保存报名信息
   * @author: 黄鹏
   */
  async saveRegistration(
    regInfo: SaveRegistrationDto,
  ): Promise<Response<XmwCetRegistration>> {
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
  async saveScore(scoreInfo: SaveScoreDto): Promise<Response<XmwCetScore>> {
    const {
      id,
      listening_score,
      reading_score,
      writing_score,
      total_score: total_score_input,
      ...rest
    } = scoreInfo;

    const l = Number(listening_score ?? 0) || 0;
    const r = Number(reading_score ?? 0) || 0;
    const w = Number(writing_score ?? 0) || 0;

    const partsSum = l + r + w;
    const totalFromInput = Number(total_score_input ?? NaN);
    // 新模板支持“直接输入总分”，因此只要传了 total_score，就优先使用它；
    // 若未传 total_score，则在分项存在时用分项求和兜底
    const total_score = Number.isFinite(totalFromInput)
      ? totalFromInput
      : partsSum > 0
        ? partsSum
        : 0;
    const is_passed = total_score >= 425;
    const data = {
      ...rest,
      listening_score: l,
      reading_score: r,
      writing_score: w,
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
        '证件号码',
        '证件号',
        '身份证号',
        '身份证号码',
        '证件编号',
        '年级',
        '学院',
        '专业',
        '班级',
        '教学班',
        '学员大队',
        '学员队',
        '学员类型',
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
            // 兼容旧模板
            student_no: toStr(
              getByAliases(row, ['学号', '学生学号', 'student_no']),
            ),
            // 新模板：证件号码
            id_card: toStr(
              getByAliases(row, [
                '证件号码',
                '证件号',
                '身份证号',
                '身份证号码',
                '证件编号',
                'id_card',
                'idcard',
              ]),
            ),
            grade: toStr(getByAliases(row, ['年级', 'grade'])),
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
            teaching_class: toStr(
              getByAliases(row, [
                '教学班',
                '教学班名称',
                '教学班级',
                '所在教学班',
                'teaching_class',
              ]),
            ),
            brigade: toStr(getByAliases(row, ['学员大队', '大队', 'brigade'])),
            squadron: toStr(
              getByAliases(row, ['学员队', '队', '中队', 'squadron']),
            ),
            student_type: toStr(
              getByAliases(row, ['学员类型', '类型', 'student_type']),
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
        // 新模板至少需要：姓名 + 证件号码（或兼容旧模板的 学号）
        .filter((r) => r.name && (r.id_card || r.student_no));

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
      const idCards = Array.from(
        new Set(parsed.map((r) => r.id_card).filter(Boolean)),
      );

      const existing = await this.registrationModel.findAll({
        where: {
          batch_id,
          [Op.or]: [
            idCards.length ? { id_card: { [Op.in]: idCards } } : undefined,
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

      const byIdCard = new Map(
        existing.filter((e) => e.id_card).map((e) => [e.id_card, e]),
      );
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
          (r.id_card && byIdCard.get(r.id_card)) ||
          (r.ticket_number && byTicket.get(r.ticket_number)) ||
          (r.student_no && byStudentNo.get(r.student_no));

        if (match) {
          const data: any = {};
          if (r.name) data.name = r.name;
          if (r.student_no) data.student_no = r.student_no;
          if (r.id_card) data.id_card = r.id_card;
          if (r.grade) data.grade = r.grade;
          if (r.department) data.department = r.department;
          if (r.major) data.major = r.major;
          if (r.class_name) data.class_name = r.class_name;
          if (r.teaching_class) data.teaching_class = r.teaching_class;
          if (r.brigade) data.brigade = r.brigade;
          if (r.squadron) data.squadron = r.squadron;
          if (r.student_type) data.student_type = r.student_type;
          if (r.exam_level) data.exam_level = r.exam_level;
          if (r.ticket_number) data.ticket_number = r.ticket_number;
          if (r.campus) data.campus = r.campus;
          toUpdate.push({
            where: { id: match.id },
            data,
          });
          continue;
        }

        // 新增时：姓名 + (证件号码 或 学号) 必须
        if (r.name && (r.id_card || r.student_no)) {
          // 为了兼容旧页面字段：如果没填学院/班级，则用新字段回填一份
          const fallback: any = { ...r };
          if (!fallback.department && fallback.brigade) {
            fallback.department = fallback.brigade;
          }
          if (!fallback.class_name && fallback.teaching_class)
            fallback.class_name = fallback.teaching_class;
          toCreate.push(fallback);
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
      return responseMessage(
        null,
        `导入失败: ${error.message || '请检查文件格式'}`,
        -1,
      );
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
        '证件号码',
        '证件号',
        '身份证号',
        '身份证号码',
        '证件编号',
        '年级',
        '学院',
        '专业',
        '班级',
        '教学班',
        '学员大队',
        '学员队',
        '学员类型',
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
        // 新模板可能只有“考试成绩/总分”
        '考试成绩',
        '成绩',
        '分数',
        '总分',
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
          const id_card = toStr(
            pickVal(row, [
              '证件号码',
              '证件号',
              '身份证号',
              '身份证号码',
              '证件编号',
              'id_card',
              'idcard',
            ]),
          );
          const grade = toStr(pickVal(row, ['年级', 'grade']));
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
          const teaching_class = toStr(
            pickVal(row, [
              '教学班',
              '教学班名称',
              '教学班级',
              '所在教学班',
              'teaching_class',
            ]),
          );
          const brigade = toStr(pickVal(row, ['学员大队', '大队', 'brigade']));
          const squadron = toStr(
            pickVal(row, ['学员队', '队', '中队', 'squadron']),
          );
          const student_type = toStr(
            pickVal(row, ['学员类型', '类型', 'student_type']),
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

          const total_score_from_cell = pickVal(row, [
            '考试成绩',
            '总分',
            '成绩',
            '分数',
            'total_score',
          ]);
          const total_score_from_total = toNum(total_score_from_cell);
          const total_score_from_parts =
            listening_score + reading_score + writing_score;
          // 如果有分项成绩，则以分项求和为准；否则优先使用“考试成绩/总分”
          const total_score =
            total_score_from_parts > 0
              ? total_score_from_parts
              : total_score_from_total;

          return {
            batch_id,
            name,
            student_no,
            id_card,
            grade,
            department,
            major,
            class_name,
            teaching_class,
            brigade,
            squadron,
            student_type,
            campus,
            exam_level,
            ticket_number,
            listening_score,
            reading_score,
            writing_score,
            total_score,
            is_passed: total_score >= 425,
          };
        })
        // 至少要能定位到某个考生：准考证号/学号/证件号码 其一
        .filter((r) => r.ticket_number || r.student_no || r.id_card);

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
      const idCards = Array.from(
        new Set(parsed.map((r) => r.id_card).filter(Boolean)),
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
            idCards.length ? { id_card: { [Op.in]: idCards } } : undefined,
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
      const byIdCard = new Map(
        existing.filter((e) => e.id_card).map((e) => [e.id_card, e]),
      );

      const toCreate: any[] = [];
      const toUpdate: { where: any; data: any }[] = [];
      let skipped = 0;

      for (const r of parsed) {
        const match =
          (r.ticket_number && byTicket.get(r.ticket_number)) ||
          (r.student_no && byStudentNo.get(r.student_no)) ||
          (r.id_card && byIdCard.get(r.id_card));

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
          if (r.id_card) baseInfo.id_card = r.id_card;
          if (r.grade) baseInfo.grade = r.grade;
          if (r.teaching_class) baseInfo.teaching_class = r.teaching_class;
          if (r.brigade) baseInfo.brigade = r.brigade;
          if (r.squadron) baseInfo.squadron = r.squadron;
          if (r.student_type) baseInfo.student_type = r.student_type;

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

        // 新模板：允许不提供准考证号/分项成绩，至少要有 name + exam_level + (student_no 或 id_card)
        if (r.name && r.exam_level && (r.student_no || r.id_card)) {
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
      // 透出具体错误信息给前端，方便排查（如数据库字段缺失、格式错误等）
      const msg = error instanceof Error ? error.message : String(error);
      return responseMessage(null, `导入成绩失败: ${msg}`, -1);
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
    let previousScores: XmwCetScore[] = [];
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
    const calcPassRate = (scores: XmwCetScore[]) => {
      if (scores.length === 0) return 0;
      const passed = scores.filter((s) => s.total_score >= 425).length;
      return (passed / scores.length) * 100;
    };

    // 筛选 CET4/CET6
    const isCet4 = (s: XmwCetScore) =>
      s.exam_level === 'CET4' || s.exam_level === 'CET-4';
    const isCet6 = (s: XmwCetScore) =>
      s.exam_level === 'CET6' || s.exam_level === 'CET-6';

    const cet4Scores = currentScores.filter(isCet4);
    const cet6Scores = currentScores.filter(isCet6);
    const prevCet4Scores = previousScores.filter(isCet4);
    const prevCet6Scores = previousScores.filter(isCet6);

    const cet4PassRateVal = calcPassRate(cet4Scores);
    const cet6PassRateVal = calcPassRate(cet6Scores);
    const prevCet4PassRateVal = calcPassRate(prevCet4Scores);
    const prevCet6PassRateVal = calcPassRate(prevCet6Scores);

    const cet4Diff = cet4PassRateVal - prevCet4PassRateVal;
    const cet6Diff = cet6PassRateVal - prevCet6PassRateVal;

    const cet4PassRateYoY =
      (cet4Diff >= 0 ? '+' : '') + cet4Diff.toFixed(1) + '%';
    const cet6PassRateYoY =
      (cet6Diff >= 0 ? '+' : '') + cet6Diff.toFixed(1) + '%';

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
      const bCet4 = bScores.filter(
        (s) => s.exam_level === 'CET4' || s.exam_level === 'CET-4',
      );
      const bCet6 = bScores.filter(
        (s) => s.exam_level === 'CET6' || s.exam_level === 'CET-6',
      );
      return {
        batchName: batch.name,
        cet4PassRate: parseFloat(calcPassRate(bCet4).toFixed(1)),
        cet6PassRate: parseFloat(calcPassRate(bCet6).toFixed(1)),
      };
    });

    // --- 雷达图 (Radar Chart) ---
    const calcAvg = (scores: XmwCetScore[], field: keyof XmwCetScore) => {
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

    const radarData = [
      { subject: '听力', A: curListening, B: prevListening },
      { subject: '阅读', A: curReading, B: prevReading },
      { subject: '写作/翻译', A: curWriting, B: prevWriting },
    ];

    // --- 分布图 (Distribution Chart) - 分别统计 CET4 和 CET6 ---
    const getDistData = (scores: XmwCetScore[]) => [
      {
        range: '<425',
        count: scores.filter((s) => s.total_score < 425).length,
      },
      {
        range: '425-500',
        count: scores.filter((s) => s.total_score >= 425 && s.total_score < 500)
          .length,
      },
      {
        range: '500-600',
        count: scores.filter(
          (s) => s.total_score >= 500 && s.total_score <= 600,
        ).length,
      },
      {
        range: '>600',
        count: scores.filter((s) => s.total_score > 600).length,
      },
    ];

    const distData = getDistData(cet4Scores);
    const cet6DistData = getDistData(cet6Scores);

    return responseMessage({
      totalCandidates,
      totalCandidatesYoY,
      cet4PassRate: cet4PassRateVal.toFixed(1) + '%',
      cet4PassRateYoY,
      cet6PassRate: cet6PassRateVal.toFixed(1) + '%',
      cet6PassRateYoY,
      avgScore,
      maxScore,
      trendData,
      radarData,
      distributionData: distData,
      cet6DistributionData: cet6DistData,
    });
  }

  /**
   * @description: 获取所有班级成绩聚合数据
   * @author: 黄鹏
   */
  async getAllClassScores(): Promise<Response<any>> {
    // 兼容旧接口：默认按“教学班”维度聚合
    return this.getScoreGroups('teaching_class');
  }

  /**
   * @description: 按维度获取成绩聚合数据
   * @param groupBy teaching_class | squadron | brigade | major | student_type
   */
  async getScoreGroups(
    groupBy: string = 'teaching_class',
  ): Promise<Response<any>> {
    const groupByKey = (groupBy || 'teaching_class').toLowerCase();

    // 1. 获取所有考次，按时间排序，用于确定成绩数组的索引顺序
    const batches = await this.cetModel.findAll({
      order: [['exam_date', 'ASC']],
      raw: true,
    });

    const batchIdToIndex = new Map<string, number>();
    batches.forEach((b, index) => {
      batchIdToIndex.set(b.id, index);
    });

    const totalBatches = batches.length;

    // 2. 获取所有成绩数据
    const allScores = await this.scoreModel.findAll({
      raw: true,
    });

    // 3. 聚合数据: Class -> Student -> Scores
    const groupMap = new Map<string, Map<string, any>>();
    // 3.1 聚合维度的“展示字段”元数据（学期/年级/培养层次）
    // - 学期：取该分组“最近一次有成绩”的考次（按 exam_date 升序后的最大索引）
    // - 年级 / 培养层次：若出现多个不同值，则返回“混合”
    const groupMetaMap = new Map<
      string,
      {
        gradeSet: Set<string>;
        cultivationSet: Set<number>;
        maxBatchIndex: number;
      }
    >();

    const ensureGroupMeta = (groupName: string) => {
      if (!groupMetaMap.has(groupName)) {
        groupMetaMap.set(groupName, {
          gradeSet: new Set<string>(),
          cultivationSet: new Set<number>(),
          maxBatchIndex: -1,
        });
      }
      return groupMetaMap.get(groupName)!;
    };

    const fixStr = (v: any) =>
      v === undefined || v === null ? v : fixMojibake(String(v));

    for (const score of allScores) {
      const groupName = (() => {
        switch (groupByKey) {
          case 'squadron':
            return fixStr(score.squadron) || '未填写学员队';
          case 'brigade':
            return fixStr(score.brigade) || '未填写学员大队';
          case 'major':
            return fixStr(score.major) || '未填写专业';
          case 'student_type':
            return fixStr(score.student_type) || '未填写学员类型';
          case 'teaching_class':
          default:
            // 新模板/导入可能只填“教学班”，因此班级字段需兼容：class_name / teaching_class
            return (
              fixStr(score.class_name) ||
              fixStr(score.teaching_class) ||
              '未分类教学班'
            );
        }
      })();

      // 优先使用学号作为唯一标识，其次证件号
      const studentId =
        fixStr(score.student_no) || fixStr(score.id_card) || fixStr(score.name);
      const studentName = fixStr(score.name);

      // 收集该分组的展示字段信息
      const meta = ensureGroupMeta(groupName);
      const grade = (fixStr((score as any).grade) || '').trim();
      if (grade) meta.gradeSet.add(grade);
      const cultivationLevel = Number((score as any).cultivation_level);
      if (Number.isFinite(cultivationLevel) && cultivationLevel > 0) {
        meta.cultivationSet.add(cultivationLevel);
      }

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, new Map());
      }
      const studentMap = groupMap.get(groupName);

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: studentName,
          classId: groupName,
          // 初始化数组，长度为考次总数 (或者固定8，视前端需求，这里动态适配)
          // 前端类型定义是 ScoreValue[]，这里为了兼容前端可能的固定索引访问，
          // 我们填充到当前考次数量，前端若只取前8个会自动截断/不足补0
          cet4Scores: new Array(totalBatches).fill(0),
          cet6Scores: new Array(totalBatches).fill(0),
        });
      }

      const student = studentMap.get(studentId);
      const batchIndex = batchIdToIndex.get(score.batch_id);

      if (batchIndex !== undefined) {
        const examLevel = fixStr(score.exam_level);
        const totalScore = Number(score.total_score) || 0;
        // 学期取“最近一次有成绩”的考次（避免把 0 分/空导入当成有效成绩）
        if (totalScore > 0) {
          meta.maxBatchIndex = Math.max(meta.maxBatchIndex, batchIndex);
        }
        if (examLevel === 'CET4' || examLevel === 'CET-4') {
          student.cet4Scores[batchIndex] = totalScore;
        } else if (examLevel === 'CET6' || examLevel === 'CET-6') {
          student.cet6Scores[batchIndex] = totalScore;
        }
      }
    }

    // 4. 转换为数组格式
    const result = [];
    for (const [groupName, studentMap] of groupMap) {
      const meta = groupMetaMap.get(groupName);
      const grade =
        meta && meta.gradeSet.size > 0
          ? meta.gradeSet.size === 1
            ? Array.from(meta.gradeSet)[0]
            : '混合'
          : undefined;
      // cultivation_level: 1/2/3；0 表示“混合”；undefined 表示无数据
      const cultivation_level =
        meta && meta.cultivationSet.size > 0
          ? meta.cultivationSet.size === 1
            ? Array.from(meta.cultivationSet)[0]
            : 0
          : undefined;
      const latestBatch =
        meta && meta.maxBatchIndex >= 0
          ? (batches as any[])[meta.maxBatchIndex]
          : undefined;
      result.push({
        id: groupName, // 维度ID暂用名称代替
        name: groupName,
        year: latestBatch?.year,
        semester: latestBatch?.semester,
        grade,
        cultivation_level,
        students: Array.from(studentMap.values()),
      });
    }

    return responseMessage(result);
  }
}
