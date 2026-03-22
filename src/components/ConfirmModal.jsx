import { useEffect, useRef } from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    modalRef.current?.querySelector('.confirm-cancel-btn')?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  return (
    <div className="confirm-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="confirm-modal animate-bounce-in" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <h3 className="confirm-title" id="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-ghost confirm-cancel-btn" onClick={onCancel}>
            {cancelLabel || 'やめる'}
          </button>
          <button
            className={`${danger ? 'btn-danger' : 'btn-primary'} confirm-ok-btn`}
            onClick={onConfirm}
          >
            {confirmLabel || 'はい'}
          </button>
        </div>
      </div>
    </div>
  );
}
