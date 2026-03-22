import './ConfirmModal.css';

export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal animate-bounce-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{title}</h3>
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
