import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';

const CourseCard = ({ course, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Can manage if Admin OR (Teacher AND Owner of the course)
    const canManage = user?.role === 'ADMIN' || (user?.role === 'TEACHER' && user?.id === course.teacherId);
    const isStudent = user?.role === 'STUDENT';

    const handleViewDetails = () => {
        navigate(`/courses/${course.id}`);
    };

    // Determine the image path (handle backend casing difference and relative paths)
    const imagePath = course.image_path || course.imagePath;
    const imageUrl = imagePath
        ? (imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}/${imagePath}`)
        : null;

    return (
        <div className="course-card">
            {imageUrl && (
                <div className="course-card-image">
                    <img src={imageUrl} alt={course.title} />
                </div>
            )}

            <div className="course-card-content">
                <h3 className="course-card-title">{course.title}</h3>
                <p className="course-card-description">
                    {course.description?.length > 120
                        ? `${course.description.substring(0, 120)}...`
                        : course.description}
                </p>

                <div className="course-card-meta">
                    <div className="course-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>{course.enrollments?.length || 0} طالب</span>
                    </div>

                    {course.teacher && (
                        <div className="course-meta-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>{course.teacher.first_name} {course.teacher.last_name}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="course-card-actions">
                <button
                    className="btn btn-primary btn-block"
                    onClick={handleViewDetails}
                >
                    عرض التفاصيل
                </button>

                {canManage && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            className="btn btn-secondary"
                            style={{ flex: 1 }}
                            onClick={() => onEdit(course)}
                        >
                            تعديل
                        </button>
                        <button
                            className="btn btn-danger"
                            style={{ flex: 1 }}
                            onClick={() => onDelete(course.id)}
                        >
                            حذف
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseCard;
