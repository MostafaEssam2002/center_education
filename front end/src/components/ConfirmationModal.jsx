import React from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    type = 'danger' // danger, warning, info, success
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-container">
                <div className="modal-icon-wrapper">
                    {type === 'danger' && <div className="modal-icon-danger"></div>}
                    {type === 'warning' && <div className="modal-icon-warning"></div>}
                    {type === 'info' && <div className="modal-icon-info"></div>}
                    {type === 'success' && <div className="modal-icon-success"></div>}
                </div>

                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>

                <div className="modal-actions">
                    <button
                        onClick={onClose}
                        className="btn-modal btn-cancel"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`btn-modal ${type === 'danger' ? 'btn-danger-action' : 'btn-confirm'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
