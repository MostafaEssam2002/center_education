import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, quizQuestionAPI } from '../services/api';

export default function ManageQuizzes() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuizzes();
    }, [courseId]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await quizAPI.findByCourse(courseId);
            setQuizzes(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load quizzes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (quizId) => {
        if (!window.confirm('Are you sure you want to publish this quiz? Students will be able to see it.')) {
            return;
        }

        try {
            await quizAPI.publish(quizId);
            alert('Quiz published successfully!');
            fetchQuizzes();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to publish quiz');
            console.error(err);
        }
    };

    const getQuizStatus = (quiz) => {
        const now = new Date();
        const start = new Date(quiz.startTime);
        const end = new Date(quiz.endTime);

        if (!quiz.isPublished) return 'Draft';
        if (now < start) return 'Scheduled';
        if (now > end) return 'Ended';
        return 'Active';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return '#6c757d';
            case 'Scheduled': return '#0d6efd';
            case 'Active': return '#198754';
            case 'Ended': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading quizzes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1>Manage Quizzes</h1>
                    <p className="subtitle">Create and manage quizzes for your course</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/courses/${courseId}/quizzes/create`)}
                >
                    Create New Quiz
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {quizzes.length === 0 ? (
                <div className="empty-state">
                    <h3>No quizzes yet</h3>
                    <p>Create your first quiz to assess your students</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/courses/${courseId}/quizzes/create`)}
                    >
                        Create Quiz
                    </button>
                </div>
            ) : (
                <div className="quiz-list">
                    {quizzes.map((quiz) => {
                        const status = getQuizStatus(quiz);
                        return (
                            <div key={quiz.id} className="quiz-card">
                                <div className="quiz-card-header">
                                    <div>
                                        <h3>{quiz.title}</h3>
                                        <span
                                            className="badge"
                                            style={{ backgroundColor: quiz.type === 'CHAPTER' ? '#0d6efd' : '#6f42c1' }}
                                        >
                                            {quiz.type === 'CHAPTER' ? 'Chapter Quiz' : 'Final Exam'}
                                        </span>
                                        <span
                                            className="badge"
                                            style={{ backgroundColor: getStatusColor(status) }}
                                        >
                                            {status}
                                        </span>
                                    </div>
                                </div>

                                <div className="quiz-card-body">
                                    {quiz.description && <p>{quiz.description}</p>}

                                    <div className="quiz-details">
                                        <div className="detail-item">
                                            <strong>Duration:</strong> {quiz.durationMin} minutes
                                        </div>
                                        <div className="detail-item">
                                            <strong>Total Marks:</strong> {quiz.totalMarks}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Start:</strong> {new Date(quiz.startTime).toLocaleString()}
                                        </div>
                                        <div className="detail-item">
                                            <strong>End:</strong> {new Date(quiz.endTime).toLocaleString()}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Questions:</strong> {quiz.questions?.length || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className="quiz-card-actions">
                                    {!quiz.isPublished && (
                                        <>
                                            <button
                                                className="btn btn-warning"
                                                onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                                                style={{ marginRight: '5px' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => navigate(`/quizzes/${quiz.id}/questions`)}
                                            >
                                                Manage Questions
                                            </button>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handlePublish(quiz.id)}
                                                disabled={!quiz.questions || quiz.questions.length === 0}
                                            >
                                                Publish Quiz
                                            </button>
                                        </>
                                    )}

                                    {quiz.isPublished && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate(`/quizzes/${quiz.id}/statistics`)}
                                        >
                                            View Statistics
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
