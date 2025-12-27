import { diskStorage } from 'multer';
import { extname } from 'path';
import { getUploadPath } from './upload-file.utils';

export const multerConfig = {
    storage: diskStorage({
        destination: (req, file, cb) => {
        try {
            const { uploadPath } = getUploadPath(file.mimetype);
            cb(null, uploadPath);
        } catch (err) {
            cb(err, '');
        }
        },
        filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + extname(file.originalname));
        },
    }),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
        try {
            getUploadPath(file.mimetype);
            cb(null, true);
        } catch (err) {
            cb(err, false);
        }
        },

};
