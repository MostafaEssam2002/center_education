import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';

export default function QuizStatistics() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const refreshIntervalRef = useRef(null);

    const [quiz, setQuiz] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchStatistics();

        // Initial fetch only sets loading
        const initialLoad = async () => {
            await fetchStatistics();
            setLoading(false);
        };
        initialLoad();

        return () => stopAutoRefresh();
    }, [quizId]);

    useEffect(() => {
        if (isAutoRefresh) {
            startAutoRefresh();
        } else {
            stopAutoRefresh();
        }
        return () => stopAutoRefresh();
    }, [isAutoRefresh]);

    const startAutoRefresh = () => {
        stopAutoRefresh();
        refreshIntervalRef.current = setInterval(() => {
            fetchStatistics(true); // silent update
        }, 10000); // Poll every 10 seconds
    };

    const stopAutoRefresh = () => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
    };

    const fetchStatistics = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError('');
            const [quizRes, statsRes] = await Promise.all([
                quizAPI.findOne(quizId),
                quizAPI.getStats(quizId),
            ]);
            setQuiz(quizRes.data);
            setStats(statsRes.data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load statistics');
            console.error(err);
            setIsAutoRefresh(false); // Stop auto-refresh on error
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!stats || !stats.attempts) return;

        const headers = ['Student Name', 'Email', 'Score', 'Total Marks', 'Percentage', 'Status', 'Time Taken (min)', 'Started At', 'Submitted At'];
        const rows = stats.attempts.map(attempt => {
            const timeTaken = attempt.submittedAt
                ? Math.floor((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 1000 / 60)
                : 'In Progress';
            const percentage = attempt.status === 'IN_PROGRESS' || attempt.status === null
                ? 'N/A'
                : ((attempt.score / quiz.totalMarks) * 100).toFixed(2);

            return [
                `${attempt.student.first_name} ${attempt.student.last_name}`,
                attempt.student.email,
                attempt.status === 'IN_PROGRESS' ? 'N/A' : attempt.score,
                quiz.totalMarks,
                percentage,
                attempt.status,
                timeTaken,
                new Date(attempt.startedAt).toLocaleString(),
                attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A',
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz_${quizId}_live_monitor.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading live monitor...</p>
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

    const { totalAttempts, averageScore, attempts } = stats;

    const submittedAttempts = attempts.filter(a => a.status === 'SUBMITTED' || a.status === 'TIMED_OUT');
    const inProgressCount = attempts.filter(a => a.status === 'IN_PROGRESS').length;

    const highestScore = submittedAttempts.length > 0
        ? Math.max(...submittedAttempts.map(a => a.score))
        : 0;

    const sortedAttempts = [...attempts].sort((a, b) => {
        // Sort: In Progress first, then most recent submitted
        if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
        if (a.status !== 'IN_PROGRESS' && b.status === 'IN_PROGRESS') return 1;
        return new Date(b.startedAt) - new Date(a.startedAt);
    });

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Live Monitoring
                        {isAutoRefresh && <span className="badge badge-success" style={{ fontSize: '0.5em', verticalAlign: 'middle' }}>● Live</span>}
                    </h1>
                    <p className="subtitle">{quiz?.title} • Last updated: {lastUpdated.toLocaleTimeString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={isAutoRefresh}
                            onChange={(e) => setIsAutoRefresh(e.target.checked)}
                        />
                        Auto-refresh (10s)
                    </label>
                    <button className="btn btn-primary" onClick={exportToCSV} disabled={attempts.length === 0}>
                        Export CSV
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                        Back
                    </button>
                </div>
            </div>

            {/* Live Stats Summary */}
            <div className="stats-summary">
                <div className="stat-card" style={{ border: '2px solid #0d6efd' }}>
                    <div className="stat-value" style={{ color: '#0d6efd' }}>{inProgressCount}</div>
                    <div className="stat-label">🔴 Currently Taking</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{submittedAttempts.length}</div>
                    <div className="stat-label">Completed</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{totalAttempts}</div>
                    <div className="stat-label">Total Participants</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{averageScore.toFixed(1)}</div>
                    <div className="stat-label">Avg Score</div>
                </div>
            </div>

            {/* Student Live List */}
            <div className="results-table-container">
                <h2>Live Student Status</h2>

                {sortedAttempts.length === 0 ? (
                    <div className="empty-state">
                        <p>No students have joined this quiz yet. Waiting for participants...</p>
                    </div>
                ) : (
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Status</th>
                                <th>Started At</th>
                                <th>Time Elapsed</th>
                                <th>Score (Live)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAttempts.map((attempt) => {
                                const percentage = ((attempt.score / quiz.totalMarks) * 100).toFixed(0);
                                const isLive = attempt.status === 'IN_PROGRESS';

                                const timeTaken = attempt.submittedAt
                                    ? Math.floor((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 1000 / 60) + ' min'
                                    : 'In Progress';

                                return (
                                    <tr key={attempt.id} style={{ backgroundColor: isLive ? '#f8f9fa' : 'inherit' }}>
                                        <td>
                                            <strong>{attempt.student.first_name} {attempt.student.last_name}</strong>
                                            <br />
                                            <small className="text-muted">{attempt.student.email}</small>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge`}
                                                style={{
                                                    backgroundColor:
                                                        attempt.status === 'IN_PROGRESS' ? '#0d6efd' :
                                                            attempt.status === 'SUBMITTED' ? '#198754' : '#dc3545'
                                                }}
                                            >
                                                {attempt.status === 'IN_PROGRESS' ? '● Live Now' :
                                                    attempt.status === 'SUBMITTED' ? 'Submitted' : 'Timed Out'}
                                            </span>
                                        </td>
                                        <td>{new Date(attempt.startedAt).toLocaleTimeString()}</td>
                                        <td>
                                            {isLive ? <span style={{ color: '#0d6efd', fontWeight: 'bold' }}>Top active...</span> : timeTaken}
                                        </td>
                                        <td>
                                            {isLive ? (
                                                <span className="text-muted">-</span>
                                            ) : (
                                                <span>
                                                    <strong>{attempt.score}</strong> <small>/ {quiz.totalMarks}</small>
                                                    <br />
                                                    <small style={{ color: percentage >= 50 ? '#198754' : '#dc3545' }}>
                                                        {percentage}%
                                                    </small>
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {!isLive && (
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => navigate(`/quiz-attempts/${attempt.id}/results`)}
                                                >
                                                    Show Paper
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
