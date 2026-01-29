import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
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
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const { folder } = getUploadPath(file.mimetype);
    // console.log('file.mimetype = ',file.mimetype)
    if (file.mimetype === "video/mp4") {
      const fileNameWithoutExtension = file.filename.split(".")[0];
      const videoDir = join(file.destination, fileNameWithoutExtension);

      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }

      fs.renameSync(file.path, join(videoDir, file.filename));

      const execAsync = promisify(exec);
      const ffmpegPath = join(process.cwd(), 'src', 'upload-file', 'ffmpeg.exe');
      try {
        await execAsync(`"${ffmpegPath}" -i "${file.filename}" -hls_time 10 -hls_playlist_type vod -hls_segment_filename "segment_%03d.ts" index.m3u8`, { cwd: videoDir });

        // Delete the original uploaded video file after conversion
        const originalFilePath = join(videoDir, file.filename);
        if (fs.existsSync(originalFilePath)) {
          fs.unlinkSync(originalFilePath);
        }
      } catch (error) {
        console.error('FFmpeg execution failed:', error);
      }

      const folderPath = `/${folder}/${fileNameWithoutExtension}`;
      // console.log("folder = ",folder)
      // console.log("videoPath = ",videoPath)
      // .\ffmpeg -i "مسلسل ما وراء الطبيعة الموسم الاول الحلقة 1 الاولي - سيما ناو - Cima Now.mp4" -hls_time 10 -hls_playlist_type vod -hls_segment_filename "segment_%03d.ts" index.m3u8
      console.log(`.\ffmpeg -i ${folderPath}/${file.filename} -hls_time 10 -hls_playlist_type vod -hls_segment_filename "segment_%03d.ts" index.m3u8`)
      console.log(`${folderPath}/index.m3u8`)
      return {
        url: `${folderPath}/index.m3u8`,
      };
      
    }
    return {
      url: `/${folder}/${file.filename}`,
    };
  }
}