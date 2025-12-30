import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterAPI, courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import PDFViewer from '../components/PDFViewer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const ChapterDetail = () => {
    const { courseId, id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [chapter, setChapter] = useState(null);
    const [allChapters, setAllChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadChapterData();
    }, [id]);

    const loadChapterData = async () => {
        setLoading(true);
        setError('');
        try {
            // Load current chapter
            const chapterResponse = await chapterAPI.findOne(id);
            setChapter(chapterResponse.data);

            // Load all chapters for navigation
            const chaptersResponse = await chapterAPI.findAllByCourse(courseId);
            setAllChapters(chaptersResponse.data.sort((a, b) => a.order - b.order));
        } catch (err) {
            setError(err.response?.data?.message || 'فشل تحميل بيانات الفصل');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentChapterIndex = () => {
        return allChapters.findIndex(ch => ch.id === parseInt(id));
    };

    const handlePrevious = () => {
        const currentIndex = getCurrentChapterIndex();
        if (currentIndex > 0) {
            navigate(`/courses/${courseId}/chapters/${allChapters[currentIndex - 1].id}`);
        }
    };

    const handleNext = () => {
        const currentIndex = getCurrentChapterIndex();
        if (currentIndex < allChapters.length - 1) {
            navigate(`/courses/${courseId}/chapters/${allChapters[currentIndex + 1].id}`);
        }
    };

    const currentIndex = getCurrentChapterIndex();
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < allChapters.length - 1;

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <div className="empty-state">جاري التحميل...</div>
                </div>
            </div>
        );
    }

    if (error || !chapter) {
        return (
            <div className="container">
                <div className="card">
                    <div className="message error">{error || 'الفصل غير موجود'}</div>
                    <button className="btn btn-secondary" onClick={() => navigate(`/courses/${courseId}`)}>
                        العودة للكورس
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2>{chapter.title}</h2>
                    <button className="btn btn-secondary" onClick={() => navigate(`/courses/${courseId}`)}>
                        العودة للكورس
                    </button>
                </div>

                {/* Chapter Navigation */}
                <div className="chapter-nav">
                    <button
                        className="btn btn-secondary"
                        onClick={handlePrevious}
                        disabled={!hasPrevious}
                    >
                        ← الفصل السابق
                    </button>
                    <span style={{ alignSelf: 'center', color: '#999' }}>
                        الفصل {currentIndex + 1} من {allChapters.length}
                    </span>
                    <button
                        className="btn btn-secondary"
                        onClick={handleNext}
                        disabled={!hasNext}
                    >
                        الفصل التالي →
                    </button>
                </div>

                {/* Chapter Content */}
                {chapter.content && (
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: '#667eea', marginBottom: '15px' }}>المحتوى</h3>
                        <div style={{
                            padding: '20px',
                            background: '#f8f9fa',
                            borderRadius: '12px',
                            lineHeight: '1.8',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {chapter.content}
                        </div>
                    </div>
                )}

                {/* Video */}
                {chapter.videoPath && (
                    <VideoPlayer
                        src={getFullUrl(chapter.videoPath)}
                        title="فيديو الفصل"
                        chapterId={chapter.id}
                    />
                )}

                {/* PDF */}
                {chapter.pdfPath && (
                    <PDFViewer
                        src={getFullUrl(chapter.pdfPath)}
                        title={`${chapter.title}.pdf`}
                    />
                )}

                {/* Images */}
                {chapter.imagePath && (
                    <div style={{ marginTop: '30px' }}>
                        <h3 style={{ color: '#667eea', marginBottom: '15px' }}>الصور</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '15px'
                        }}>
                            <img
                                src={chapter.imagePath}
                                alt={chapter.title}
                                style={{
                                    width: '100%',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom Navigation */}
                <div className="chapter-nav" style={{ marginTop: '30px' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handlePrevious}
                        disabled={!hasPrevious}
                    >
                        ← الفصل السابق
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleNext}
                        disabled={!hasNext}
                    >
                        الفصل التالي →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChapterDetail;
