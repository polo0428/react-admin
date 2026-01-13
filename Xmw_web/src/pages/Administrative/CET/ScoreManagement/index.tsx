import { LeftOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { history, useLocation, useRequest } from '@umijs/max';
import { Button, Card, Input, message, Select, Space, Tag, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { getScoreList, saveScore } from '@/services/administrative/cet';

import { ExamBatch } from '../components/CreateExamModal';
import ScoreModal from './components/ScoreModal';
import ScoreStats from './components/ScoreStats';
import ScoreTable from './components/ScoreTable';
import { ExamLevel, ScoreRecord } from './components/types';

const { Title } = Typography;
const { Option } = Select;

// eslint-disable-next-line
const mapScoreItem = (item: any, defaultExamDate: string): ScoreRecord => ({
  id: item.student_no || item.studentNo,
  name: item.name,
  department: item.department || '',
  major: item.major || '',
  classId: item.class_name || item.className || '',
  batchId: item.batch_id || item.batchId,
  examLevel: (item.exam_level || item.examLevel) as ExamLevel,
  examDate: defaultExamDate || item.created_time?.split(' ')[0] || '',
  campus: item.campus,
  ticketNumber: item.ticket_number || item.ticketNumber,
  totalScore: Number(item.total_score || item.totalScore || 0),
  listeningScore: Number(item.listening_score || item.listeningScore || 0),
  readingScore: Number(item.reading_score || item.readingScore || 0),
  writingTranslationScore: Number(
    item.writing_score || item.writingScore || item.writingTranslationScore || 0,
  ),
  passed: item.is_passed === true || item.is_passed === 1 || item.isPassed === true,
});

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

  // 获取成绩列表
  // eslint-disable-next-line consistent-return
  const { data, loading, refresh, run } = useRequest(async (params) => {
    if (!batch?.id) return { list: [], total: 0 };
    const res = await getScoreList({
      batch_id: batch.id,
      keyword: searchTerm,
      exam_level: levelFilter === 'all' ? undefined : levelFilter,
      current: params?.current || 1,
      pageSize: params?.pageSize || 10,
    });

    console.log('res', res);
    const rawRes = res as any;
    console.log('API Response Raw:', rawRes);
    const responseData = rawRes?.data || rawRes || {};

    if (responseData?.list) {
      const defaultExamDate = batch?.exam_date || '';
      const mappedScores = responseData.list.map((item: any) =>
        mapScoreItem(item, defaultExamDate),
      );
      console.log('Mapped Scores:', mappedScores);
      setScores(mappedScores);
    } else {
      setScores([]);
    }
  });

  const scoreData = data as { list: any[]; total: number } | undefined;

  // 移除 scores 的 useMemo
  // const scores: ScoreRecord[] = useMemo(() => { ... });

  // 计算统计数据 (基于当前页数据，如果需要全量统计需要单独接口)
  const stats = useMemo(() => {
    // 这里暂时使用当前页数据进行统计，实际应用中建议后端返回统计数据
    // 或者如果数据量不大，可以前端一次性拉取所有数据
    if (scores.length === 0) return null;
    const total = scores.length; // 注意：这里只是当前页的数量
    const passed = scores.filter((s) => s.passed).length;
    const passRate = ((passed / total) * 100).toFixed(1);
    const totalScoreSum = scores.reduce((sum, s) => sum + s.totalScore, 0);
    const avgScore = Math.round(totalScoreSum / total);
    const maxScore = Math.max(...scores.map((s) => s.totalScore));

    // 如果后端返回了总数，我们可以显示总人数，但通过率等只能基于当前页计算，这可能不准确。
    // 为了更好的体验，这里我们只在有数据时显示统计组件，且明确它是基于列表数据的。
    return {
      total: scoreData?.total || total,
      passed,
      passRate,
      avgScore,
      maxScore,
    };
  }, [scores, scoreData]);

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
        class_name: values.classId, // 注意：ScoreModal 需要支持 classId 输入
        batch_id: batch.id,
        exam_level: values.examLevel,
        ticket_number: values.ticketNumber,
        listening_score: values.listeningScore,
        reading_score: values.readingScore,
        writing_score: values.writingTranslationScore,
        campus: values.campus,
      });

      message.success('保存成功');
      setIsModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Save failed:', error);
      // message.error('保存失败'); // httpRequest 可能会自动处理错误提示
    }
  };

  const handleBack = () => {
    history.push('/cet');
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
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
              <Option value={ExamLevel.CET4}>CET-4</Option>
              <Option value={ExamLevel.CET6}>CET-6</Option>
            </Select>
          </Space>
        </div>

        <ScoreTable
          dataSource={scores}
          loading={loading}
          pagination={{
            total: scoreData?.total || 0,
            pageSize: 10,
            onChange: (page, pageSize) => {
              run({ current: page, pageSize });
            },
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
