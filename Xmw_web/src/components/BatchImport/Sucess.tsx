'use client';

import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';
import { BizType } from './type';

const Success: React.FC<{
  type?: BizType;
  count: number;
  onBack?: () => void;
  backPath?: string;
}> = ({ count, backPath = '/system/staff', onBack, type = 'student' }) => {
  const router = useRouter();
  const handleClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.push(backPath);
  };
  return (
    <Result
      status="success"
      title={`成功导入${count}${type === 'dict' ? '个部门' : type === 'plan' || (type === 'course' || type =='planFields') ? '条数据' : type === 'class' ? '个班级' : type === 'adminClass' ? '个班级' : '人'}`}
      extra={
        <Button type="primary" onClick={handleClick}>
          返回查看
        </Button>
      }
    />
  );
};

export default Success;
