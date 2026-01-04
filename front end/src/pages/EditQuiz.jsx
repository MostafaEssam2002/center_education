import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, chapterAPI, courseAPI } from '../services/api';

export default function EditQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [course, setCourse] = useState(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'CHAPTER',
        chapterId: '',
        courseId: '',
        startTime: '',
        endTime: '',
        durationMin: 30,
        totalMarks: 10,
        keepAnswers: false,
    });

    useEffect(() => {
        fetchQuizDetails();
    }, [quizId]);

    const fetchQuizDetails = async () => {
        try {
            setLoading(true);
            const response = await quizAPI.findOne(quizId);
            const quiz = response.data;

            // Format dates for input[type="datetime-local"]
            const formatDateTime = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                // Adjust to local time string format: YYYY-MM-DDTHH:MM
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date - -offset)).toISOString().slice(0, 16);
                return localISOTime;
            };

            setFormData({
                title: quiz.title,
                description: quiz.description || '',
                type: quiz.type,
                chapterId: quiz.chapterId || '',
                courseId: quiz.courseId || '',
                startTime: formatDateTime(quiz.startTime),
                endTime: formatDateTime(quiz.endTime),
                durationMin: quiz.durationMin,
                totalMarks: quiz.totalMarks,
                keepAnswers: quiz.keepAnswers,
            });

            // Fetch chapters and course info based on the quiz's course/chapter
            // If it's a chapter quiz, the course is accessed via chapter.course
            // If it's a final quiz, course is direct
            const courseId = quiz.courseId || quiz.chapter?.courseId;
            if (courseId) {
                const [courseRes, chaptersRes] = await Promise.all([
                    courseAPI.findAll(), // Ideally fetchOne but findAll is cached/avail
                    chapterAPI.findAllByCourse(courseId),
                ]);
                const foundCourse = courseRes.data.find(c => c.id === courseId);
                setCourse(foundCourse);
                setChapters(chaptersRes.data);
            }

        } catch (err) {
            setError('Failed to load quiz details');
            console.error(err);
        } finally {
            setLoading(false);
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
                // Do not allow changing type/chapter/course easily to prevent logic errors
                // But for now, let's keep basic editable fields
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                durationMin: parseInt(formData.durationMin),
                totalMarks: parseInt(formData.totalMarks),
                keepAnswers: formData.keepAnswers,
            };

            await quizAPI.update(quizId, quizData);
            alert('Quiz updated successfully!');
            navigate(-1); // Go back to quiz list
        } catch (err) {
            console.error('Quiz update error:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to update quiz');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.title) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1>Edit Quiz</h1>
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
                    />
                </div>

                {/* Read-only Type Display */}
                <div className="form-group">
                    <label>Quiz Type</label>
                    <input
                        type="text"
                        value={formData.type === 'CHAPTER' ? 'Chapter Quiz' : 'Final Exam'}
                        disabled
                        className="form-control"
                    />
                </div>

                {formData.type === 'CHAPTER' && (
                    <div className="form-group">
                        <label>Chapter</label>
                        <select
                            id="chapterId"
                            name="chapterId"
                            value={formData.chapterId}
                            disabled
                        >
                            <option value="">-- Chapter --</option>
                            {chapters.map((chapter) => (
                                <option key={chapter.id} value={chapter.id}>
                                    {chapter.order}. {chapter.title}
                                </option>
                            ))}
                        </select>
                        <small className="text-muted">Cannot change chapter once created</small>
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
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
