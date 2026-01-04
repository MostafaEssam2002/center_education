import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, quizAttemptAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TakeQuiz() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState(new Set());
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const timerRef = useRef(null);
    const answerSaveTimeoutRef = useRef(null);

    useEffect(() => {
        initializeQuiz();

        // Prevent accidental page close
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (timerRef.current) clearInterval(timerRef.current);
            if (answerSaveTimeoutRef.current) clearTimeout(answerSaveTimeoutRef.current);
        };
    }, [quizId]);

    useEffect(() => {
        if (attempt && quiz) {
            startTimer();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [attempt, quiz]);

    const initializeQuiz = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('=== QUIZ START DEBUG ===');
            console.log('User:', user);
            console.log('User Role:', user?.role);
            console.log('Quiz ID:', quizId);
            console.log('=======================');

            // Get quiz details
            const quizRes = await quizAPI.findOne(quizId);
            const quizData = quizRes.data;
            setQuiz(quizData);
            setQuestions(quizData.questions || []);

            // Start or resume attempt
            const attemptRes = await quizAttemptAPI.start(quizId);
            const attemptData = attemptRes.data;
            setAttempt(attemptData);

            // Load existing answers if resuming
            if (attemptData.answers && attemptData.answers.length > 0) {
                const answersMap = {};
                attemptData.answers.forEach(ans => {
                    answersMap[ans.questionId] = ans.optionId;
                });
                setAnswers(answersMap);
            }

        } catch (err) {
            console.error('=== QUIZ START ERROR ===');
            console.error('Full error:', err);
            console.error('Response:', err.response);
            console.error('Response data:', err.response?.data);
            console.error('========================');

            setError(err.response?.data?.message || 'Failed to start quiz');
            console.error(err);

            // Redirect back if can't start quiz
            setTimeout(() => {
                navigate('/my-quizzes');
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        if (!attempt || !quiz) return;

        const calculateTimeRemaining = () => {
            const startTime = new Date(attempt.startedAt).getTime();
            const duration = quiz.durationMin * 60 * 1000;
            const deadline = startTime + duration;
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((deadline - now) / 1000));
            return remaining;
        };

        setTimeRemaining(calculateTimeRemaining());

        timerRef.current = setInterval(() => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                clearInterval(timerRef.current);
                handleAutoSubmit();
            }
        }, 1000);
    };

    const handleAnswerSelect = async (questionId, optionId) => {
        // Update local state immediately
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));

        // Debounce API call
        if (answerSaveTimeoutRef.current) {
            clearTimeout(answerSaveTimeoutRef.current);
        }

        answerSaveTimeoutRef.current = setTimeout(async () => {
            try {
                await quizAttemptAPI.submitAnswer(attempt.id, questionId, optionId);
            } catch (err) {
                console.error('Failed to save answer:', err);
                // Don't show error to user for auto-save failures
            }
        }, 500);
    };

    const handleAutoSubmit = async () => {
        if (submitting) return;

        setSubmitting(true);
        try {
            await quizAttemptAPI.finish(attempt.id);
            alert('Time is up! Quiz has been automatically submitted.');
            navigate('/my-quizzes');
        } catch (err) {
            console.error('Auto-submit failed:', err);
            alert('Failed to submit quiz. Please try again.');
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        const unansweredCount = questions.length - Object.keys(answers).length;

        let confirmMessage = 'Are you sure you want to submit your quiz?';
        if (unansweredCount > 0) {
            confirmMessage += `\n\nYou have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}.`;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        setSubmitting(true);
        try {
            const result = await quizAttemptAPI.finish(attempt.id);
            alert(`Quiz submitted successfully!\n\nYour score: ${result.data.score}/${quiz.totalMarks}`);

            if (quiz.keepAnswers) {
                navigate(`/quiz-attempts/${attempt.id}/results`);
            } else {
                navigate('/my-quizzes');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit quiz');
            console.error(err);
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getQuestionStatus = (questionIndex) => {
        const question = questions[questionIndex];
        if (!question) return 'unanswered';

        if (markedForReview.has(question.id)) return 'review';
        if (answers[question.id] !== undefined) return 'answered';
        return 'unanswered';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'answered': return '#198754';
            case 'review': return '#ffc107';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                    <p>Redirecting back to quizzes...</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isTimeCritical = timeRemaining < 300; // Less than 5 minutes

    return (
        <div className="quiz-taking-container">
            {/* Timer Header */}
            <div className="quiz-timer-header">
                <div className="quiz-info">
                    <h2>{quiz.title}</h2>
                    <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>
                <div
                    className={`timer-display ${isTimeCritical ? 'timer-critical' : ''}`}
                    style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: isTimeCritical ? '#dc3545' : '#198754',
                        padding: '10px 20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                    }}
                >
                    ⏱️ {formatTime(timeRemaining)}
                </div>
            </div>

            <div className="quiz-content-wrapper">
                {/* Question Display */}
                <div className="question-display">
                    <div className="question-header">
                        <h3>Question {currentQuestionIndex + 1}</h3>
                        <span className="marks-badge">{currentQuestion.marks} {currentQuestion.marks === 1 ? 'Mark' : 'Marks'}</span>
                    </div>

                    <p className="question-text">{currentQuestion.question}</p>

                    <div className="options-container">
                        {currentQuestion.options?.map((option, index) => (
                            <label
                                key={option.id}
                                className={`option-label ${answers[currentQuestion.id] === option.id ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion.id}`}
                                    value={option.id}
                                    checked={answers[currentQuestion.id] === option.id}
                                    onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                                />
                                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="option-text">{option.text}</span>
                            </label>
                        ))}
                    </div>

                    <div className="question-actions">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={markedForReview.has(currentQuestion.id)}
                                onChange={(e) => {
                                    const newMarked = new Set(markedForReview);
                                    if (e.target.checked) {
                                        newMarked.add(currentQuestion.id);
                                    } else {
                                        newMarked.delete(currentQuestion.id);
                                    }
                                    setMarkedForReview(newMarked);
                                }}
                            />
                            Mark for Review
                        </label>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="navigation-buttons">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            ← Previous
                        </button>

                        {currentQuestionIndex < questions.length - 1 ? (
                            <button
                                className="btn btn-secondary"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                className="btn btn-success"
                                onClick={handleSubmit}
                                disabled={submitting}
                                style={{ fontSize: '1.1rem', padding: '12px 24px' }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Question Navigator */}
                <div className="question-navigator">
                    <h4>Question Navigator</h4>
                    <div className="navigator-grid">
                        {questions.map((q, index) => {
                            const status = getQuestionStatus(index);
                            return (
                                <button
                                    key={q.id}
                                    className={`navigator-button ${currentQuestionIndex === index ? 'current' : ''}`}
                                    style={{
                                        backgroundColor: getStatusColor(status),
                                        color: 'white',
                                        border: currentQuestionIndex === index ? '3px solid #0d6efd' : 'none',
                                    }}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="legend">
                        <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: '#198754' }}></div>
                            <span>Answered</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: '#ffc107' }}></div>
                            <span>Review</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: '#6c757d' }}></div>
                            <span>Unanswered</span>
                        </div>
                    </div>

                    <div className="quiz-summary">
                        <p><strong>Answered:</strong> {Object.keys(answers).length}/{questions.length}</p>
                        <p><strong>For Review:</strong> {markedForReview.size}</p>
                    </div>

                    <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{ width: '100%', marginTop: '20px' }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
