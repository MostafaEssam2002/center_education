import { BadRequestException } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

export const mimeTypeMap = {
    'image/jpeg': 'images',
    'image/png': 'images',
    'image/webp': 'images',

    'application/pdf': 'pdfs',

    'video/mp4': 'videos',
    'video/mpeg': 'videos',
    'video/quicktime': 'videos',
    'video/x-msvideo': 'videos',
    'video/x-matroska': 'videos',
    'video/webm': 'videos',

    'audio/mpeg': 'audio',
    'audio/wav': 'audio',
    'audio/ogg': 'audio',
    'audio/mp4': 'audio',
};

export function getUploadPath(mimetype: string) {
    const folder = mimeTypeMap[mimetype];
    if (!folder) {
        throw new BadRequestException('Unsupported file type');
    }

    const uploadPath = join(process.cwd(), 'public', folder);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return { folder, uploadPath };
}
