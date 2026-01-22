import { LeftOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useLocation, useRequest } from '@umijs/max';
import { Button, Card, Input, message, Select, Space, Tag, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import {
  deleteScore,
  getScoreAnalysis,
  getScoreList,
  saveScore,
} from '@/services/administrative/ncre';
import { navigateWithMenuParam } from '@/utils';

import { ExamBatch } from '../components/CreateExamModal';
import ScoreModal from './components/ScoreModal';
import ScoreStats from './components/ScoreStats';
import ScoreTable from './components/ScoreTable';
import { ExamLevel, ScoreRecord, ScoreStatsData } from './components/types';

const { Title } = Typography;
const { Option } = Select;

// eslint-disable-next-line
const parseExamLevel = (raw: any): { level: ExamLevel; subject?: string } => {
  const s = String(raw ?? '');
  const [level, subject] = s.split('|');
  return { level: (level as ExamLevel) || (s as ExamLevel), subject: subject || undefined };
};

// eslint-disable-next-line
const mapScoreItem = (item: any, defaultExamDate: string): ScoreRecord => {
  const parsed = parseExamLevel(item.exam_level || item.examLevel);
  const theoryScore = Number(item.listening_score || item.listeningScore || 0);
  const practiceScore = Number(item.reading_score || item.readingScore || 0);
  const totalScore = Number(
    item.total_score || item.totalScore || theoryScore + practiceScore || 0,
  );
  return {
    recordId: item.id,
    id: item.student_no || item.studentNo,
    name: item.name,
    department: item.department || '',
    major: item.major || '',
    batchId: item.batch_id || item.batchId,
    examLevel: parsed.level,
    examSubject: parsed.subject,
    examDate: defaultExamDate || item.created_time?.split(' ')[0] || '',
    ticketNumber: item.ticket_number || item.ticketNumber,
    totalScore,
    theoryScore,
    practiceScore,
    passed: item.is_passed === true || item.is_passed === 1 || item.isPassed === true,
  };
};

/**
 * 成绩管理主页面
 * 包含成绩列表展示、统计分析、搜索筛选以及手动录入功能
 */
export default function ScoreManagement() {
  const location = useLocation();
  const state = location.state as { examItem?: ExamBatch } | undefined;
  const batch = state?.examItem;

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [scores, setScores] = useState<ScoreRecord[]>([]);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 用于存储总数，因为 data 在 onSuccess 中可能还未更新或者类型不对
  const [totalCount, setTotalCount] = useState(0);
  const [statsData, setStatsData] = useState<any>(null);

  // 获取成绩列表
  // eslint-disable-next-line consistent-return
  const { loading, refresh, run } = useRequest(
    async (params) => {
      if (!batch?.id) return { list: [], total: 0 };
      const res = await getScoreList({
        batch_id: batch.id,
        current: params?.current || current,
        pageSize: params?.pageSize || pageSize,
        keyword: searchTerm,
        exam_level: levelFilter === 'all' ? undefined : levelFilter,
      });

      // console.log('res', res);
      const rawRes = res as any;
      // console.log('API Response Raw:', rawRes);
      const responseData = rawRes?.data || rawRes || {};

      if (responseData?.list) {
        const defaultExamDate = batch?.exam_date || '';
        const mappedScores = responseData.list.map((item: any) =>
          mapScoreItem(item, defaultExamDate),
        );
        // console.log('Mapped Scores:', mappedScores);
        setScores(mappedScores);
        setTotalCount(responseData.total || 0); // 更新总数状态
        return {
          list: mappedScores,
          total: responseData.total || 0,
        };
      }
      setScores([]);
      setTotalCount(0);
      return { list: [], total: 0 };
    },
    {
      refreshDeps: [batch?.id], // 仅当批次ID变化时自动刷新
      debounceInterval: 300, // 节流/防抖时间
    },
  );

  // 监听筛选条件变化，触发搜索并重置页码
  React.useEffect(() => {
    setCurrent(1);
    run({ current: 1, pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, levelFilter]);

  // 获取统计数据
  useRequest(
    async () => {
      if (!batch?.id) return null;
      const res = await getScoreAnalysis({ batch_id: batch.id });
      // 兼容直接返回数据和 {code, data} 结构
      const result = (res as any)?.data || res;
      setStatsData(result);
      return result;
    },
    {
      refreshDeps: [batch?.id, isModalOpen], // 当批次变化或保存操作后刷新统计
    },
  );

  const stats: ScoreStatsData | null = useMemo(() => {
    // console.log('statsData', statsData);
    if (!statsData) return null;
    return {
      total: statsData.total,
      passed: statsData.passed,
      passRate: statsData.passRate,
      avgScore: statsData.avgScore,
      maxScore: statsData.maxScore,
    };
  }, [statsData]);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      if (!batch?.id) {
        message.error('未找到考次信息');
        return;
      }

      await saveScore({
        name: values.name,
        student_no: values.id,
        department: values.department,
        major: values.major,
        batch_id: batch.id,
        exam_level: values.examLevel,
        ticket_number: values.ticketNumber,
        // 兼容后端现有字段：理论/操作分别落到 listening/readng，writing 固定 0
        listening_score: values.theoryScore,
        reading_score: values.practiceScore,
        writing_score: 0,
      });

      message.success('保存成功');
      setIsModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Save failed:', error);
      // message.error('保存失败'); // httpRequest 可能会自动处理错误提示
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
      await deleteScore(recordId);
      message.success('删除成功');
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleBack = () => {
    navigateWithMenuParam('/ncre/list');
  };

  return (
    <div className="space-y-6 p-6 pt-0 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <Button
          type="link"
          onClick={handleBack}
          icon={<LeftOutlined />}
          style={{ padding: 0, width: 'fit-content' }}
        >
          返回考次列表
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Title level={3} style={{ margin: 0 }}>
                成绩查询与管理
              </Title>
              {batch && (
                <Tag color={batch.status === 'published' ? 'success' : 'geekblue'}>
                  {batch.name} {batch.status === 'published' && '(已完成)'}
                </Tag>
              )}
            </div>
          </div>

          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClick}>
              录入单条成绩
            </Button>
          </Space>
        </div>
      </div>

      {stats && <ScoreStats stats={stats} />}

      <Card bodyStyle={{ padding: 0 }} className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="搜索学生姓名或学号..."
            style={{ maxWidth: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />

          <Space>
            <Select
              defaultValue="all"
              value={levelFilter}
              onChange={setLevelFilter}
              style={{ width: 120 }}
            >
              <Option value="all">所有级别</Option>
              <Option value={ExamLevel.NCRE1}>计算机一级</Option>
              <Option value={ExamLevel.NCRE2}>计算机二级</Option>
              <Option value={ExamLevel.NCRE3}>计算机三级</Option>
              <Option value={ExamLevel.NCRE4}>计算机四级</Option>
            </Select>
          </Space>
        </div>

        <ScoreTable
          dataSource={scores}
          loading={loading}
          onDelete={handleDelete}
          pagination={{
            total: totalCount || 0,
            current,
            pageSize,
            onChange: (page, size) => {
              setCurrent(page);
              setPageSize(size);
              run({ current: page, pageSize: size });
            },
            showTotal: (total, range) => `显示第 ${range[0]} 到 ${range[1]} 条，共 ${total} 条结果`,
          }}
        />
      </Card>

      <ScoreModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onFinish={handleSave}
        batchName={batch?.name}
      />
    </div>
  );
}
