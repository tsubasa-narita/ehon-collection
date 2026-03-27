import { useState, useCallback, useEffect } from 'react';
import './ParentLock.css';

/**
 * 親モードロック画面
 * 子ども→親モードへの切替時に簡易計算問題で保護
 */
export default function ParentLock({ onUnlock, onCancel }) {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const generateQuestion = useCallback(() => {
    const a = Math.floor(Math.random() * 8) + 2; // 2-9
    const b = Math.floor(Math.random() * 8) + 2; // 2-9
    return { a, b, correct: a * b };
  }, []);

  useEffect(() => {
    setQuestion(generateQuestion());
  }, [generateQuestion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question) return;

    if (parseInt(answer, 10) === question.correct) {
      onUnlock();
    } else {
      setError(true);
      setAnswer('');
      setTimeout(() => {
        setError(false);
        setQuestion(generateQuestion());
      }, 800);
    }
  };

  if (!question) return null;

  return (
    <div className="parent-lock-overlay" role="dialog" aria-modal="true">
      <div className={`parent-lock-card ${error ? 'animate-shake' : 'animate-bounce-in'}`}>
        <div className="parent-lock-icon">🔒</div>
        <h2 className="parent-lock-title">おやモードに切りかえ</h2>
        <p className="parent-lock-desc">
          もんだいにこたえてね
        </p>

        <form onSubmit={handleSubmit} className="parent-lock-form">
          <div className="parent-lock-question">
            <span className="parent-lock-num">{question.a}</span>
            <span className="parent-lock-op">×</span>
            <span className="parent-lock-num">{question.b}</span>
            <span className="parent-lock-eq">=</span>
            <input
              type="number"
              inputMode="numeric"
              className={`parent-lock-input ${error ? 'parent-lock-input-error' : ''}`}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              autoFocus
              aria-label="こたえ"
              placeholder="?"
            />
          </div>
          <button type="submit" className="btn-primary parent-lock-submit" disabled={!answer.trim()}>
            🔓 かくにん
          </button>
        </form>

        <button className="btn-ghost parent-lock-cancel" onClick={onCancel}>
          もどる
        </button>
      </div>
    </div>
  );
}
