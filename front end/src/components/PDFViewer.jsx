const PDFViewer = ({ src, title }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = title || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenInNewTab = () => {
        window.open(src, '_blank');
    };

    return (
        <div className="pdf-viewer-container">
            <div className="pdf-viewer-header">
                {title && <h3 className="pdf-title">{title}</h3>}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={handleOpenInNewTab}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        فتح في نافذة جديدة
                    </button>
                    <button className="btn btn-secondary" onClick={handleDownload}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        تحميل PDF
                    </button>
                </div>
            </div>

            <div className="pdf-viewer-wrapper">
                <object
                    data={src}
                    type="application/pdf"
                    width="100%"
                    height="800px"
                    style={{ border: 'none', borderRadius: '8px' }}
                >
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '2px dashed #ddd'
                    }}>
                        <p style={{ marginBottom: '20px', color: '#666' }}>
                            المتصفح لا يدعم عرض PDF مباشرة
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={handleOpenInNewTab}>
                                فتح PDF في نافذة جديدة
                            </button>
                            <button className="btn btn-secondary" onClick={handleDownload}>
                                تحميل PDF
                            </button>
                        </div>
                    </div>
                </object>
            </div>
        </div>
    );
};

export default PDFViewer;
