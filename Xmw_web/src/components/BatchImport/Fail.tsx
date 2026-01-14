import { Button, Result } from 'antd';
import type { DataType, TypeEnum } from './FailedList';
import FailedList from './FailedList';

interface Props<T> {
  type: TypeEnum;
  data: DataType<T>[];
  retry: () => void;
}

const Fail = <T extends TypeEnum>({ type, data, retry }: Props<T>) => (
  <Result
    status="error"
    title={`上传失败${data.length}人`}
    extra={
      <Button type="primary" onClick={retry}>
        修改后重新导入
      </Button>
    }
  >
    <FailedList<T> type={type} data={data} />
  </Result>
);

export default Fail;
