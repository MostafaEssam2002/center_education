import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, quizQuestionAPI, quizOptionAPI } from '../services/api';

export default function ManageQuestions() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const [newQuestion, setNewQuestion] = useState({
        question: '',
        marks: 1,
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
        ],
    });

    useEffect(() => {
        fetchQuizAndQuestions();
    }, [quizId]);

    const fetchQuizAndQuestions = async () => {
        try {
            setLoading(true);
            setError('');
            const [quizRes, questionsRes] = await Promise.all([
                quizAPI.findOne(quizId),
                quizQuestionAPI.findAll(quizId),
            ]);
            setQuiz(quizRes.data);
            setQuestions(questionsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load quiz data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOption = () => {
        if (newQuestion.options.length >= 6) {
            alert('Maximum 6 options allowed');
            return;
        }
        setNewQuestion(prev => ({
            ...prev,
            options: [...prev.options, { text: '', isCorrect: false }],
        }));
    };

    const handleRemoveOption = (index) => {
        if (newQuestion.options.length <= 2) {
            alert('Minimum 2 options required');
            return;
        }
        setNewQuestion(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleOptionChange = (index, field, value) => {
        setNewQuestion(prev => {
            const newOptions = [...prev.options];

            if (field === 'isCorrect' && value) {
                // Only one option can be correct
                newOptions.forEach((opt, i) => {
                    opt.isCorrect = i === index;
                });
            } else {
                newOptions[index] = { ...newOptions[index], [field]: value };
            }

            return { ...prev, options: newOptions };
        });
    };

    const handleSubmitQuestion = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!newQuestion.question.trim()) {
            setError('Question text is required');
            return;
        }

        if (newQuestion.options.some(opt => !opt.text.trim())) {
            setError('All options must have text');
            return;
        }

        const correctCount = newQuestion.options.filter(opt => opt.isCorrect).length;
        if (correctCount !== 1) {
            setError('Exactly one option must be marked as correct');
            return;
        }

        try {
            setLoading(true);

            // Create question
            const questionRes = await quizQuestionAPI.create({
                quizId: parseInt(quizId),
                question: newQuestion.question,
                marks: parseInt(newQuestion.marks),
            });

            // Create options
            await Promise.all(
                newQuestion.options.map(option =>
                    quizOptionAPI.create({
                        questionId: questionRes.data.id,
                        text: option.text,
                        isCorrect: option.isCorrect,
                    })
                )
            );

            alert('Question added successfully!');
            setShowAddForm(false);
            setNewQuestion({
                question: '',
                marks: 1,
                options: [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                ],
            });
            fetchQuizAndQuestions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add question');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            await quizQuestionAPI.remove(questionId);
            alert('Question deleted successfully!');
            fetchQuizAndQuestions();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete question');
            console.error(err);
        }
    };

    const handlePublish = async () => {
        if (questions.length === 0) {
            alert('Cannot publish quiz without questions');
            return;
        }

        if (!window.confirm('Are you sure you want to publish this quiz? Students will be able to see it.')) {
            return;
        }

        try {
            await quizAPI.publish(quizId);
            alert('Quiz published successfully!');
            navigate(-1);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to publish quiz');
            console.error(err);
        }
    };

    if (loading && !quiz) {
        return (
            <div className="container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1>Manage Questions</h1>
                    {quiz && (
                        <>
                            <p className="subtitle">{quiz.title}</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <span className="badge" style={{ backgroundColor: '#0d6efd' }}>
                                    {questions.length} Questions
                                </span>
                                <span className={`badge ${questions.reduce((sum, q) => sum + q.marks, 0) === quiz.totalMarks ? 'badge-success' : 'badge-warning'}`}
                                    style={{ backgroundColor: questions.reduce((sum, q) => sum + q.marks, 0) === quiz.totalMarks ? '#198754' : '#dc3545' }}>
                                    Total Marks: {questions.reduce((sum, q) => sum + q.marks, 0)} / {quiz.totalMarks}
                                </span>
                            </div>
                            {questions.reduce((sum, q) => sum + q.marks, 0) !== quiz.totalMarks && (
                                <div className="alert alert-warning" style={{ marginTop: '10px', padding: '0.5rem' }}>
                                    ⚠️ Warning: Start adding/removing questions or adjust marks. The total ({questions.reduce((sum, q) => sum + q.marks, 0)}) must equal ({quiz.totalMarks}) to publish.
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {quiz && !quiz.isPublished && (
                        <button
                            className="btn btn-success"
                            onClick={handlePublish}
                            disabled={questions.length === 0 || questions.reduce((sum, q) => sum + q.marks, 0) !== quiz.totalMarks}
                            title={questions.reduce((sum, q) => sum + q.marks, 0) !== quiz.totalMarks ? "Total marks must match quiz total to publish" : "Publish Quiz"}
                        >
                            Publish Quiz
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Existing Questions */}
            {questions.length > 0 && (
                <div className="questions-list">
                    <h2>Questions ({questions.length})</h2>
                    {questions.map((question, index) => (
                        <div key={question.id} className="question-card">
                            <div className="question-header">
                                <h3>Question {index + 1}</h3>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span className="badge" style={{ backgroundColor: '#198754' }}>
                                        {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                                    </span>
                                    {!quiz?.isPublished && (
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            title="Delete Question"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="question-text">{question.question}</p>
                            <div className="options-list">
                                {question.options?.map((option, optIndex) => (
                                    <div
                                        key={option.id}
                                        className={`option-item ${option.isCorrect ? 'correct-option' : ''}`}
                                    >
                                        <span className="option-label">{String.fromCharCode(65 + optIndex)}.</span>
                                        <span>{option.text}</span>
                                        {option.isCorrect && <span className="correct-badge">✓ Correct</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Question Button/Form */}
            {!showAddForm && !quiz?.isPublished && (
                <button
                    className="btn btn-primary"
                    style={{ marginTop: '20px', width: '100%' }}
                    onClick={() => setShowAddForm(true)}
                >
                    + Add New Question
                </button>
            )}

            {showAddForm && (
                <div className="add-question-form">
                    <h2>Add New Question</h2>
                    <form onSubmit={handleSubmitQuestion}>
                        <div className="form-group">
                            <label htmlFor="question">Question Text *</label>
                            <textarea
                                id="question"
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                                rows="3"
                                placeholder="Enter your question here"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="marks">Marks *</label>
                            <input
                                type="number"
                                id="marks"
                                value={newQuestion.marks}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, marks: e.target.value }))}
                                min="1"
                                style={{ maxWidth: '150px' }}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Options * (Select the correct answer)</label>
                            {newQuestion.options.map((option, index) => (
                                <div key={index} className="option-input-row">
                                    <input
                                        type="radio"
                                        name="correctOption"
                                        checked={option.isCorrect}
                                        onChange={() => handleOptionChange(index, 'isCorrect', true)}
                                    />
                                    <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                        required
                                    />
                                    {newQuestion.options.length > 2 && (
                                        <button
                                            type="button"
                                            className="btn-icon btn-danger"
                                            onClick={() => handleRemoveOption(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}

                            {newQuestion.options.length < 6 && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleAddOption}
                                    style={{ marginTop: '10px' }}
                                >
                                    + Add Option
                                </button>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setError('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Question'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
