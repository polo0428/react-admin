import { LeftOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { history, useLocation } from '@umijs/max';
import { Button, Card, Input, Select, Space, Tag, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import { ExamBatch } from '../components/CreateExamModal';
import ScoreModal from './components/ScoreModal';
import ScoreStats from './components/ScoreStats';
import ScoreTable from './components/ScoreTable';
import { ExamLevel, ScoreRecord } from './components/types';

const { Title, Text } = Typography;
const { Option } = Select;

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
  const [loading, setLoading] = useState(false);

  // 模拟数据状态 (后续可替换为API调用)
  const [scores, setScores] = useState<ScoreRecord[]>([]);

  // 筛选成绩列表
  const filteredScores = useMemo(() => {
    return scores.filter((score) => {
      const matchesBatch = batch ? score.batchId === batch.id : true;
      const matchesSearch =
        score.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.id.includes(searchTerm);
      const matchesLevel = levelFilter === 'all' || score.examLevel === levelFilter;
      return matchesBatch && matchesSearch && matchesLevel;
    });
  }, [batch, searchTerm, levelFilter, scores]);

  // 计算统计数据
  const stats = useMemo(() => {
    if (filteredScores.length === 0) return null;
    const total = filteredScores.length;
    const passed = filteredScores.filter((s) => s.passed).length;
    const passRate = ((passed / total) * 100).toFixed(1);
    const totalScoreSum = filteredScores.reduce((sum, s) => sum + s.totalScore, 0);
    const avgScore = Math.round(totalScoreSum / total);
    const maxScore = Math.max(...filteredScores.map((s) => s.totalScore));
    return { total, passed, passRate, avgScore, maxScore };
  }, [filteredScores]);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      // 模拟保存延迟
      // await new Promise((resolve) => setTimeout(resolve, 500));

      const listening = Number(values.listeningScore) || 0;
      const reading = Number(values.readingScore) || 0;
      const writing = Number(values.writingTranslationScore) || 0;
      const total = listening + reading + writing;

      const newScore: ScoreRecord = {
        id: values.id,
        name: values.name,
        department: values.department || '未知学院',
        major: values.major || '未知专业',
        classId: values.classId || '未知班级',
        batchId: batch?.id || 'manual_entry',
        examLevel: values.examLevel as ExamLevel,
        examDate: batch?.exam_date || new Date().toISOString().split('T')[0],
        campus: values.campus || '本部',
        ticketNumber: values.ticketNumber,
        totalScore: total,
        listeningScore: listening,
        readingScore: reading,
        writingTranslationScore: writing,
        passed: total >= 425,
      };

      setScores((prev) => [newScore, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
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
            <Text type="secondary">查询 {batch ? '该批次' : '所有'} 学生考试成绩及详情。</Text>
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

        <ScoreTable dataSource={filteredScores} loading={loading} />
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
