import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseFilters,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateResponseDto } from './response/create.dto';
import { FileValidationExceptionFilter } from './exception-filter/file-validation.exceptionfilter';

@ApiTags('upload')
@Controller('upload')
@UseFilters(FileValidationExceptionFilter)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({
    summary: 'upload file',
    description: '파일 업로드 png, jpeg, jpg만 가능, 최대 4MB',
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: '파일 업로드 성공',
    type: CreateResponseDto,
  })
  @Post()
  @UseInterceptors(FileInterceptor('image', { dest: './uploads' }))
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          //확장자만 검사함.
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 4,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadService.create(file);
  }
}
