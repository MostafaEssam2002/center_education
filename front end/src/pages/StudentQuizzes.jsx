import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentQuizzes() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');

    useEffect(() => {
        fetchEnrolledCourses();
    }, [user]);

    const fetchEnrolledCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await enrollmentAPI.getCoursesByStudent(user.id);
            setCourses(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getQuizStatus = (quiz, attempt) => {
        const now = new Date();
        const start = new Date(quiz.startTime);
        const end = new Date(quiz.endTime);

        if (!quiz.isPublished) return { status: 'Not Published', color: '#6c757d', disabled: true };

        if (attempt) {
            if (attempt.status === 'IN_PROGRESS') {
                return { status: 'In Progress', color: '#ffc107', disabled: false };
            }
            if (attempt.status === 'SUBMITTED') {
                return { status: 'Completed', color: '#198754', disabled: true };
            }
            if (attempt.status === 'TIMED_OUT') {
                return { status: 'Timed Out', color: '#dc3545', disabled: true };
            }
        }

        if (now < start) {
            return { status: 'Not Started', color: '#6c757d', disabled: true };
        }
        if (now > end) {
            return { status: 'Expired', color: '#dc3545', disabled: true };
        }
        return { status: 'Available', color: '#198754', disabled: false };
    };

    const handleStartQuiz = (quizId, hasAttempt) => {
        navigate(`/quizzes/${quizId}/take`);
    };

    const handleViewResults = (attemptId) => {
        navigate(`/quiz-attempts/${attemptId}/results`);
    };

    const allQuizzes = courses.flatMap(course =>
        course.course.Quiz?.map(quiz => ({
            ...quiz,
            courseName: course.course.title,
            courseId: course.course.id,
            attempt: quiz.attempts?.[0],
        })) || []
    );

    const filteredQuizzes = selectedCourse === 'all'
        ? allQuizzes
        : allQuizzes.filter(q => q.courseId === parseInt(selectedCourse));

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
                    <h1>My Quizzes</h1>
                    <p className="subtitle">Available quizzes from your enrolled courses</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Course Filter */}
            {courses.length > 0 && (
                <div className="filter-bar">
                    <label htmlFor="courseFilter">Filter by Course:</label>
                    <select
                        id="courseFilter"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="all">All Courses</option>
                        {courses.map(({ course }) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {filteredQuizzes.length === 0 ? (
                <div className="empty-state">
                    <h3>No quizzes available</h3>
                    <p>
                        {selectedCourse === 'all'
                            ? 'Your teachers haven\'t published any quizzes yet.'
                            : 'No quizzes available for this course.'}
                    </p>
                </div>
            ) : (
                <div className="quiz-list">
                    {filteredQuizzes.map((quiz) => {
                        const { status, color, disabled } = getQuizStatus(quiz, quiz.attempt);
                        const hasAttempt = !!quiz.attempt;

                        return (
                            <div key={quiz.id} className="quiz-card">
                                <div className="quiz-card-header">
                                    <div>
                                        <h3>{quiz.title}</h3>
                                        <p className="course-name">{quiz.courseName}</p>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                            <span
                                                className="badge"
                                                style={{ backgroundColor: quiz.type === 'CHAPTER' ? '#0d6efd' : '#6f42c1' }}
                                            >
                                                {quiz.type === 'CHAPTER' ? 'Chapter Quiz' : 'Final Exam'}
                                            </span>
                                            <span
                                                className="badge"
                                                style={{ backgroundColor: color }}
                                            >
                                                {status}
                                            </span>
                                            {hasAttempt && quiz.attempt.status === 'SUBMITTED' && (
                                                <span className="badge" style={{ backgroundColor: '#198754' }}>
                                                    Score: {quiz.attempt.score}/{quiz.totalMarks}
                                                </span>
                                            )}
                                        </div>
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
                                            <strong>Available From:</strong> {new Date(quiz.startTime).toLocaleString()}
                                        </div>
                                        <div className="detail-item">
                                            <strong>Available Until:</strong> {new Date(quiz.endTime).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="quiz-card-actions">
                                    {status === 'Available' && !hasAttempt && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleStartQuiz(quiz.id, false)}
                                        >
                                            Start Quiz
                                        </button>
                                    )}

                                    {status === 'In Progress' && (
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => handleStartQuiz(quiz.id, true)}
                                        >
                                            Resume Quiz
                                        </button>
                                    )}

                                    {(status === 'Completed' || status === 'Timed Out') && quiz.keepAnswers && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleViewResults(quiz.attempt.id)}
                                        >
                                            View Results
                                        </button>
                                    )}

                                    {disabled && !hasAttempt && (
                                        <span className="text-muted">
                                            {status === 'Not Started' && 'Quiz not started yet'}
                                            {status === 'Expired' && 'Quiz deadline passed'}
                                        </span>
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
