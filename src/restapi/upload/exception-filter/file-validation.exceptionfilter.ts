// file-validation.exception.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';

@Catch(HttpException)
export class FileValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (status === 400) {
      // If the exception status is 400 (Bad Request), it means a validation error occurred
      // Delete the uploaded file if it exists
      const request = ctx.getRequest();
      if (request.file && request.file.path) {
        fs.unlinkSync(request.file.path);
      }
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Bad Request',
    });
  }
}
