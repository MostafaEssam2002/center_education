import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { quizAPI, chapterAPI, courseAPI } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

export default function CreateQuiz() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [course, setCourse] = useState(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'CHAPTER',
        chapterId: '',
        startTime: '',
        endTime: '',
        durationMin: 30,
        totalMarks: 10,
        keepAnswers: false,
    });

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
        confirmText: 'موافق',
        hideCancel: true,
        onConfirm: () => { }
    });

    useEffect(() => {
        fetchCourseAndChapters();
    }, [courseId]);

    const fetchCourseAndChapters = async () => {
        try {
            const [courseRes, chaptersRes] = await Promise.all([
                courseAPI.findAll(),
                chapterAPI.findAllByCourse(courseId),
            ]);

            const foundCourse = courseRes.data.find(c => c.id === parseInt(courseId));
            setCourse(foundCourse);
            setChapters(chaptersRes.data);

            // Check if chapterId is provided in URL params
            const urlChapterId = searchParams.get('chapterId');
            if (urlChapterId) {
                setFormData(prev => ({
                    ...prev,
                    chapterId: urlChapterId,
                    type: 'CHAPTER',
                }));
            }
        } catch (err) {
            setError('Failed to load course data');
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        if (formData.type === 'CHAPTER' && !formData.chapterId) {
            setError('Please select a chapter');
            return;
        }

        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);

        if (start >= end) {
            setError('End time must be after start time');
            return;
        }

        if (formData.durationMin < 1) {
            setError('Duration must be at least 1 minute');
            return;
        }

        if (formData.totalMarks < 1) {
            setError('Total marks must be at least 1');
            return;
        }

        try {
            setLoading(true);

            const quizData = {
                title: formData.title,
                description: formData.description || undefined,
                type: formData.type,
                chapterId: formData.type === 'CHAPTER' ? parseInt(formData.chapterId) : undefined,
                courseId: formData.type === 'FINAL' ? parseInt(courseId) : undefined,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                durationMin: parseInt(formData.durationMin),
                totalMarks: parseInt(formData.totalMarks),
                keepAnswers: formData.keepAnswers,
            };

            console.log('Creating quiz with data:', quizData);
            console.log('Current user from token:', localStorage.getItem('user'));

            const response = await quizAPI.create(quizData);


            setModalConfig({
                isOpen: true,
                title: 'تم إنشاء الاختبار',
                message: 'تم إنشاء الاختبار بنجاح!',
                type: 'success',
                confirmText: 'موافق',
                hideCancel: true,
                onConfirm: () => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    navigate(`/quizzes/${response.data.id}/questions`);
                }
            });
        } catch (err) {
            console.error('Quiz creation error:', err.response?.data);
            setModalConfig({
                isOpen: true,
                title: 'خطأ',
                message: err.response?.data?.message || 'فشل إنشاء الاختبار',
                type: 'danger',
                confirmText: 'موافق',
                hideCancel: true,
                onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>Create New Quiz</h1>
                <p className="subtitle">
                    {course ? `For: ${course.title}` : 'Loading...'}
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label htmlFor="title">Quiz Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Chapter 1 Quiz"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Optional description for students"
                    />
                </div>

                <div className="form-group">
                    <label>Quiz Type *</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="type"
                                value="CHAPTER"
                                checked={formData.type === 'CHAPTER'}
                                onChange={handleChange}
                            />
                            Chapter Quiz
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="type"
                                value="FINAL"
                                checked={formData.type === 'FINAL'}
                                onChange={handleChange}
                            />
                            Final Exam (Entire Course)
                        </label>
                    </div>
                </div>

                {formData.type === 'CHAPTER' && (
                    <div className="form-group">
                        <label htmlFor="chapterId">Select Chapter *</label>
                        <select
                            id="chapterId"
                            name="chapterId"
                            value={formData.chapterId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select Chapter --</option>
                            {chapters.map((chapter) => (
                                <option key={chapter.id} value={chapter.id}>
                                    {chapter.order}. {chapter.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="startTime">Start Date & Time *</label>
                        <input
                            type="datetime-local"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="endTime">End Date & Time *</label>
                        <input
                            type="datetime-local"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="durationMin">Duration (minutes) *</label>
                        <input
                            type="number"
                            id="durationMin"
                            name="durationMin"
                            value={formData.durationMin}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="totalMarks">Total Marks *</label>
                        <input
                            type="number"
                            id="totalMarks"
                            name="totalMarks"
                            value={formData.totalMarks}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="keepAnswers"
                            checked={formData.keepAnswers}
                            onChange={handleChange}
                        />
                        Allow students to review their answers after submission
                    </label>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate(`/courses/${courseId}/quizzes`)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Quiz'}
                    </button>
                </div>
            </form>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                hideCancel={modalConfig.hideCancel}
            />
        </div >
    );
}
