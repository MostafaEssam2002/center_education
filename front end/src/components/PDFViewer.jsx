const PDFViewer = ({ src, title }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = title || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="pdf-viewer-container">
            <div className="pdf-viewer-header">
                {title && <h3 className="pdf-title">{title}</h3>}
                <button className="btn btn-secondary" onClick={handleDownload}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    تحميل PDF
                </button>
            </div>

            <div className="pdf-viewer-wrapper">
                <embed
                    src={src}
                    type="application/pdf"
                    width="100%"
                    height="800px"
                    className="pdf-embed"
                />
            </div>
        </div>
    );
};

export default PDFViewer;
