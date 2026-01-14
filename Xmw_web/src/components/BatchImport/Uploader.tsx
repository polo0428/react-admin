import { FileExcelOutlined, InboxOutlined } from '@ant-design/icons';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { App, Upload } from 'antd';
import { useState } from 'react';
import SpreadRestArea from '../SpreadRestArea';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

type Props = {
  run: (data: FormData) => Promise<any>;
  filename?: string;
  url?: string; // Template download URL
  downloadName?: string;
};

const Uploader = ({
  run,
  filename = '导入模板.xlsx',
  url,
  downloadName = '下载导入模板',
}: Props) => {
  const [fileList, setFileList] = useState<UploadFile<FileType>[]>([]);
  const { message } = App.useApp();

  const props: UploadProps = {
    beforeUpload(file) {
      if (file.size / 1024 / 1024 > 25) {
        message.error('文件大小不能超过25M');
        return false;
      }
      setFileList([...fileList, file]);
      return true;
    },
    fileList,
    accept:
      '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    maxCount: 1,
    showUploadList: false,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      const reqData = new FormData();
      reqData.append('file', file as FileType);
      try {
        await run(reqData);
        if (onSuccess) onSuccess('ok');
      } catch (e) {
        console.log('e', e);
        if (onError) onError(e as Error);
      } finally {
        setFileList([]);
      }
    },
  };

  return (
    <SpreadRestArea
      marginBottom={68}
      className="flex flex-col items-center justify-center"
    >
      <Upload.Dragger {...props} className="bg-white w-2/3 h-[400px]">
        <div className="mb-4">
          <InboxOutlined style={{ fontSize: 64, color: '#1677ff' }} />
        </div>
        <p className="text-[18px]">点击或拖拽文件上传</p>
      </Upload.Dragger>
      {url && (
        <div
          className="group mt-12"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <a
            className="text-blue-500 group-hover:underline flex gap-2 items-center"
            href={url}
            download={filename}
          >
            <FileExcelOutlined style={{ fontSize: 20 }} />
            <span>{downloadName}</span>
          </a>
        </div>
      )}
    </SpreadRestArea>
  );
};

export default Uploader;
