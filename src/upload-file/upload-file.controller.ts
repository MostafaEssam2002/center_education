import {BadRequestException,Controller,Post,UploadedFile,UseInterceptors,} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {ApiBadRequestResponse,ApiBody,ApiConsumes,ApiCreatedResponse,ApiOperation,ApiTags,} from '@nestjs/swagger';
import { multerConfig } from './multer.config';
import { getUploadPath } from './upload-file.utils';

@ApiTags('Upload')
@Controller('upload-file')
export class UploadFileController {
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload a file and receive its public URL' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (image/video/etc)',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded successfully',
    schema: {
      example: { url: '/images/example.png' },
    },
  })
  @ApiBadRequestResponse({ description: 'File is missing or invalid' })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const { folder } = getUploadPath(file.mimetype);
    return {
      url: `/${folder}/${file.filename}`,
    };
  }
}