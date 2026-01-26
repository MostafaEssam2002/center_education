import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, ArrowLeft, X, Save, AlertCircle, FileQuestion } from 'lucide-react';
import { quizAPI, quizQuestionAPI, quizOptionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import './ManageQuestions.css';

export default function ManageQuestions() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Initial state with stable IDs for the form
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        marks: 1,
        options: [
            { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
            { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
        ],
    });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => { },
    });

    useEffect(() => {
        fetchQuizAndQuestions();
    }, [quizId]);

    const fetchQuizAndQuestions = async (page = currentPage) => {
        try {
            setLoading(true);
            setError('');
            const [quizRes, questionsRes] = await Promise.all([
                quizAPI.findOne(quizId),
                quizQuestionAPI.findAll(quizId, page),
            ]);
            setQuiz(quizRes.data);

            if (questionsRes.data.data) {
                setQuestions(questionsRes.data.data);
                setPagination(questionsRes.data.pagination);
                setCurrentPage(page);
            } else {
                setQuestions(questionsRes.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load quiz data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOption = () => {
        if (newQuestion.options.length >= 6) {
            showToast('Maximum 6 options allowed', 'info');
            return;
        }
        setNewQuestion(prev => ({
            ...prev,
            options: [...prev.options, { id: `opt-${Date.now()}`, text: '', isCorrect: false }],
        }));
    };

    const handleRemoveOption = (id) => {
        if (newQuestion.options.length <= 2) {
            showToast('Minimum 2 options required', 'info');
            return;
        }
        setNewQuestion(prev => ({
            ...prev,
            options: prev.options.filter(opt => opt.id !== id),
        }));
    };

    const handleOptionChange = (id, field, value) => {
        setNewQuestion(prev => {
            const newOptions = prev.options.map(opt => {
                if (opt.id === id) {
                    return { ...opt, [field]: value };
                }
                // If setting this option as correct, uncheck others
                if (field === 'isCorrect' && value === true) {
                    return { ...opt, isCorrect: false };
                }
                return opt;
            });
            return { ...prev, options: newOptions };
        });
    };

    const handleSubmitQuestion = async (e) => {
        e.preventDefault();
        setError('');

        if (!newQuestion.question.trim()) {
            showToast('Question text is required', 'error');
            return;
        }

        if (newQuestion.options.some(opt => !opt.text.trim())) {
            showToast('All options must have text', 'error');
            return;
        }

        const correctCount = newQuestion.options.filter(opt => opt.isCorrect).length;
        if (correctCount !== 1) {
            showToast('Exactly one option must be marked as correct', 'error');
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

            showToast('Question added successfully!', 'success');
            setShowAddForm(false);
            // Reset form with new IDs
            setNewQuestion({
                question: '',
                marks: 1,
                options: [
                    { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
                    { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
                ],
            });
            fetchQuizAndQuestions(currentPage);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add question', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = (questionId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Question',
            message: 'Are you sure you want to delete this question?',
            type: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    await quizQuestionAPI.remove(questionId);
                    showToast('Question deleted successfully!', 'success');
                    fetchQuizAndQuestions(currentPage);
                } catch (err) {
                    showToast(err.response?.data?.message || 'Failed to delete question', 'error');
                    console.error(err);
                }
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        });
    };

    const handlePublish = () => {
        if (questions.length === 0) {
            showToast('Cannot publish quiz without questions', 'error');
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Publish Quiz',
            message: 'Are you sure you want to publish this quiz? Students will be able to see it.',
            type: 'info',
            confirmText: 'Publish',
            cancelText: 'Cancel',
            onConfirm: async () => {
                try {
                    await quizAPI.publish(quizId);
                    showToast('Quiz published successfully!', 'success');
                    navigate(-1);
                } catch (err) {
                    showToast(err.response?.data?.message || 'Failed to publish quiz', 'error');
                    console.error(err);
                }
                setConfirmModal({ ...confirmModal, isOpen: false });
            }
        });
    };

    if (loading && !quiz) {
        return (
            <div className="mq-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loading-spinner" style={{ borderTopColor: '#2563eb', borderRightColor: '#2563eb' }}></div>
            </div>
        );
    }

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const isMarksValid = quiz && totalMarks === quiz.totalMarks;

    return (
        <div className="mq-container">
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                onConfirm={confirmModal.onConfirm}
            />

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mq-header"
            >
                <div className="mq-title-section">
                    <h1>Manage Questions</h1>
                    {quiz && (
                        <>
                            <p className="mq-subtitle">{quiz.title}</p>
                            <div className="mq-stats">
                                <span className="mq-stat-badge primary">
                                    <FileQuestion size={14} />
                                    {questions.length} Questions
                                </span>
                                <span className={`mq-stat-badge ${isMarksValid ? 'success' : 'warning'}`}>
                                    <CheckCircle size={14} />
                                    Marks: {totalMarks} / {quiz.totalMarks}
                                </span>
                            </div>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {quiz && !quiz.isPublished && (
                        <button
                            className="mq-btn mq-btn-primary"
                            onClick={handlePublish}
                            disabled={!isMarksValid || questions.length === 0}
                            title={!isMarksValid ? "Total marks must match quiz total to publish" : "Publish Quiz"}
                            style={{ opacity: (!isMarksValid || questions.length === 0) ? 0.6 : 1 }}
                        >
                            Publish Quiz
                        </button>
                    )}
                    <button
                        className="mq-btn mq-btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
            </motion.div>

            {quiz && !isMarksValid && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="alert alert-warning"
                    style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <AlertCircle size={20} />
                    <span>
                        Warning: The total marks of questions ({totalMarks}) must equal the quiz total marks ({quiz.totalMarks}) to publish.
                    </span>
                </motion.div>
            )}

            {error && (
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mq-question-list">
                <AnimatePresence>
                    {questions.map((question, index) => (
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="mq-question-card"
                        >
                            <div className="mq-q-header">
                                <div>
                                    <div className="mq-q-number">Question {index + 1}</div>
                                    <div className="mq-q-text">{question.question}</div>
                                </div>
                                <div className="mq-q-actions">
                                    <span className="mq-stat-badge success">
                                        {question.marks} Mark{question.marks !== 1 && 's'}
                                    </span>
                                    {!quiz?.isPublished && (
                                        <button
                                            className="mq-icon-btn danger"
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            title="Delete Question"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mq-options-grid">
                                {question.options?.map((option, optIndex) => (
                                    <div
                                        key={option.id}
                                        className={`mq-option ${option.isCorrect ? 'correct' : ''}`}
                                    >
                                        <span className="mq-option-marker">
                                            {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        <span>{option.text}</span>
                                        {option.isCorrect && <CheckCircle size={16} style={{ marginLeft: 'auto' }} />}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Pagination Controls */}
                {pagination && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
                        <button
                            className="mq-btn mq-btn-secondary"
                            disabled={currentPage === 1}
                            onClick={() => fetchQuizAndQuestions(currentPage - 1)}
                            style={{ padding: '8px 16px' }}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {pagination.totalPages}</span>
                        <button
                            className="mq-btn mq-btn-secondary"
                            disabled={currentPage === pagination.totalPages}
                            onClick={() => fetchQuizAndQuestions(currentPage + 1)}
                            style={{ padding: '8px 16px' }}
                        >
                            Next
                        </button>
                    </div>
                )}

                {questions.length === 0 && !showAddForm && (
                    <div className="mq-empty-state">
                        <FileQuestion size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3>No questions yet</h3>
                        <p>Click the button below to add your first question.</p>
                    </div>
                )}
            </div>

            {!showAddForm && !quiz?.isPublished && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ marginTop: '24px' }}
                >
                    <button
                        className="mq-add-option-btn"
                        style={{ height: '60px', fontSize: '16px', border: '2px dashed #2563eb', color: '#2563eb', background: '#eff6ff' }}
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus size={24} /> Add New Question
                    </button>
                </motion.div>
            )}

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="mq-form-container"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 className="mq-form-title">Add New Question</h2>
                            <button className="mq-icon-btn" onClick={() => setShowAddForm(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitQuestion}>
                            <div className="mq-input-group">
                                <label className="mq-label" htmlFor="question">Question Text *</label>
                                <textarea
                                    id="question"
                                    className="mq-input"
                                    value={newQuestion.question}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                                    rows="3"
                                    placeholder="Type your question here..."
                                    required
                                />
                            </div>

                            <div className="mq-input-group">
                                <label className="mq-label" htmlFor="marks">Marks *</label>
                                <input
                                    type="number"
                                    id="marks"
                                    className="mq-input"
                                    value={newQuestion.marks}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, marks: e.target.value }))}
                                    min="1"
                                    style={{ maxWidth: '120px' }}
                                    required
                                />
                            </div>

                            <div className="mq-input-group">
                                <label className="mq-label">Options * (Select correct answer)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {newQuestion.options.map((option, index) => (
                                        <motion.div
                                            key={option.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="mq-input-row"
                                        >
                                            <input
                                                type="radio"
                                                name="correctOption"
                                                className="mq-radio"
                                                checked={option.isCorrect}
                                                onChange={() => handleOptionChange(option.id, 'isCorrect', true)}
                                                title="Mark as correct answer"
                                            />
                                            <span className="mq-option-marker" style={{ background: option.isCorrect ? '#2563eb' : '#f3f4f6', color: option.isCorrect ? 'white' : '#6b7280', border: 'none' }}>
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            <input
                                                type="text"
                                                className="mq-input"
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                style={{ flex: 1, border: option.isCorrect ? '1px solid #2563eb' : '1px solid #d1d5db', background: option.isCorrect ? '#eff6ff' : 'white' }}
                                                required
                                            />
                                            {newQuestion.options.length > 2 && (
                                                <button
                                                    type="button"
                                                    className="mq-delete-opt-btn"
                                                    onClick={() => handleRemoveOption(option.id)}
                                                    title="Remove option"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {newQuestion.options.length < 6 && (
                                <button
                                    type="button"
                                    className="mq-add-option-btn"
                                    onClick={handleAddOption}
                                    style={{ marginTop: '12px' }}
                                >
                                    <Plus size={18} /> Add Another Option
                                </button>
                            )}

                            <div className="mq-form-actions">
                                <button
                                    type="button"
                                    className="mq-btn mq-btn-secondary"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="mq-btn mq-btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : <><Save size={18} /> Save Question</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
