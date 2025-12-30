import { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

const FileUpload = ({
    onUploadSuccess,
    acceptedTypes = 'image/*,video/*,application/pdf',
    maxSizeMB = 50,
    label = 'رفع ملف'
}) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return `حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB}MB`;
        }

        // Check file type
        const acceptedTypesArray = acceptedTypes.split(',').map(t => t.trim());
        const fileType = file.type;
        const isAccepted = acceptedTypesArray.some(type => {
            if (type.endsWith('/*')) {
                return fileType.startsWith(type.replace('/*', ''));
            }
            return fileType === type;
        });

        if (!isAccepted) {
            return 'نوع الملف غير مدعوم';
        }

        return null;
    };

    const handleFileChange = async (file) => {
        if (!file) return;

        setError('');
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview({ type: 'image', url: reader.result, name: file.name });
            };
            reader.readAsDataURL(file);
        } else {
            setPreview({ type: 'file', name: file.name, size: (file.size / 1024).toFixed(2) });
        }

        // Upload file
        setUploading(true);
        try {
            const response = await uploadAPI.uploadFile(file);
            const fileUrl = response.data.url;
            onUploadSuccess(fileUrl, file);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'فشل رفع الملف');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleClear = () => {
        setPreview(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="file-upload-container">
            <label className="file-upload-label">{label}</label>

            <div
                className={`file-upload-dropzone ${dragActive ? 'active' : ''} ${error ? 'error' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="upload-status">
                        <div className="loading-spinner"></div>
                        <p>جاري الرفع...</p>
                    </div>
                ) : preview ? (
                    <div className="upload-preview">
                        {preview.type === 'image' ? (
                            <img src={preview.url} alt="Preview" className="preview-image" />
                        ) : (
                            <div className="preview-file">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                    <polyline points="13 2 13 9 20 9"></polyline>
                                </svg>
                                <p className="preview-filename">{preview.name}</p>
                                {preview.size && <p className="preview-filesize">{preview.size} KB</p>}
                            </div>
                        )}
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            حذف
                        </button>
                    </div>
                ) : (
                    <div className="upload-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <p>اسحب الملف هنا أو اضغط للاختيار</p>
                        <p className="upload-hint">الحد الأقصى: {maxSizeMB}MB</p>
                    </div>
                )}
            </div>

            {error && <div className="message error" style={{ marginTop: '10px' }}>{error}</div>}
        </div>
    );
};

export default FileUpload;
