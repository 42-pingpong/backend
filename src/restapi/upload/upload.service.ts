import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateResponseDto } from './response/create.dto';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  create(fileInfo: MulterFile) {
    const res = new CreateResponseDto();
    res.url =
      this.configService.get<string>('url.nestServerUrl') +
      '/images/' +
      fileInfo.filename;

    return res;
  }
}
