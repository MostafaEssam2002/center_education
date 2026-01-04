import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAttemptAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function QuizResults() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttemptDetails();
    }, [attemptId]);

    const fetchAttemptDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await quizAttemptAPI.review(attemptId);
            setAttempt(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load results');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    const { quiz, answers, score, status, startedAt, submittedAt, student } = attempt;
    const percentage = ((score / quiz.totalMarks) * 100).toFixed(2);
    const timeTaken = submittedAt
        ? Math.floor((new Date(submittedAt) - new Date(startedAt)) / 1000 / 60)
        : quiz.durationMin;

    const isTeacher = (quiz.course?.teacherId === user.id) || (quiz.chapter?.course?.teacherId === user.id);
    const isStudent = student && student.id === user.id;

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1>Quiz Results</h1>
                    <p className="subtitle">{quiz.title}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Back
                </button>
            </div>

            {/* Score Summary */}
            <div className="results-summary">
                <div className="score-card">
                    <div className="score-circle" style={{
                        background: percentage >= 50 ? '#198754' : '#dc3545',
                    }}>
                        <span className="score-value">{percentage}%</span>
                        <span className="score-label">Score</span>
                    </div>

                    <div className="score-details">
                        <div className="detail-row">
                            <span className="label">Marks Obtained:</span>
                            <span className="value">{score} / {quiz.totalMarks}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Status:</span>
                            <span className={`badge ${status === 'SUBMITTED' ? 'badge-success' : 'badge-warning'}`}>
                                {status === 'SUBMITTED' ? 'Submitted' : 'Timed Out'}
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Time Taken:</span>
                            <span className="value">{timeTaken} minutes</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Submitted At:</span>
                            <span className="value">{submittedAt ? new Date(submittedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                        {isTeacher && (
                            <div className="detail-row">
                                <span className="label">Student:</span>
                                <span className="value">{student.first_name} {student.last_name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Questions Review */}
            <div className="questions-review">
                <h2>Answer Review</h2>

                {quiz.questions.map((question, qIndex) => {
                    const studentAnswer = answers.find(a => a.questionId === question.id);
                    const selectedOption = studentAnswer?.option;
                    const correctOption = question.options.find(opt => opt.isCorrect);
                    const isCorrect = studentAnswer?.isCorrect || false;

                    return (
                        <div key={question.id} className="review-question-card">
                            <div className="review-question-header">
                                <h3>Question {qIndex + 1}</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span className="badge" style={{ backgroundColor: '#6c757d' }}>
                                        {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                                    </span>
                                    <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>
                                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                    </span>
                                </div>
                            </div>

                            <p className="review-question-text">{question.question}</p>

                            <div className="review-options">
                                {question.options.map((option, optIndex) => {
                                    const isSelected = selectedOption?.id === option.id;
                                    const isCorrectAnswer = option.isCorrect;

                                    let optionClass = 'review-option';
                                    if (isCorrectAnswer) optionClass += ' correct-answer';
                                    if (isSelected && !isCorrectAnswer) optionClass += ' wrong-answer';
                                    if (isSelected && isCorrectAnswer) optionClass += ' correct-selected';

                                    return (
                                        <div key={option.id} className={optionClass}>
                                            <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                                            <span className="option-text">{option.text}</span>
                                            <div className="option-indicators">
                                                {isSelected && <span className="indicator">Your Answer</span>}
                                                {isCorrectAnswer && <span className="indicator correct">✓ Correct Answer</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {!studentAnswer && (
                                <div className="alert alert-warning" style={{ marginTop: '10px' }}>
                                    <strong>Not Answered</strong>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
