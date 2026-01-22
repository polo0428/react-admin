import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: String,
    description: '文件流',
    format: 'binary',
  })
  file: any;
}
