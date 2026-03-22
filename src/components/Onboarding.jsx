import { useState, useEffect, useCallback } from 'react';
import { useVoice } from '../hooks/useVoice';
import './Onboarding.css';

const SLIDES = [
  {
    emoji: '📷',
    title: 'えほんをスキャン！',
    desc: 'バーコードをよみとって\nえほんをとうろくしよう',
    voice: 'えほんのバーコードをよみとって、とうろくしよう！',
  },
  {
    emoji: '📖',
    title: 'よんだらボタンをおす！',
    desc: 'えほんをよんだら\n「よんだ！」ボタンをおそう',
    voice: 'えほんをよんだら、よんだボタンをおそう！',
  },
  {
    emoji: '🚂',
    title: 'でんしゃをゲット！',
    desc: 'たくさんよむと\nでんしゃがもらえるよ！',
    voice: 'たくさんよむと、でんしゃがもらえるよ！',
  },
];

export default function Onboarding({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const { speak } = useVoice();

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      const next = current + 1;
      setCurrent(next);
      speak(SLIDES[next].voice);
    }
  };

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onComplete();
  }, [onComplete]);

  useEffect(() => {
    speak(SLIDES[0].voice);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [speak, handleEscape]);

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="つかいかたガイド">
      <div className="onboarding-card animate-bounce-in" key={current}>
        <div className="onboarding-emoji">{slide.emoji}</div>
        <h2 className="onboarding-title">{slide.title}</h2>
        <p className="onboarding-desc">{slide.desc}</p>

        {/* Dots */}
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`onboarding-dot ${i === current ? 'onboarding-dot-active' : ''}`}
            />
          ))}
        </div>

        <button className="btn-primary onboarding-btn" onClick={handleNext}>
          {isLast ? '🚂 はじめる！' : 'つぎへ ▶'}
        </button>

        {!isLast && (
          <button className="btn-ghost onboarding-skip" onClick={onComplete}>
            スキップ
          </button>
        )}
      </div>
    </div>
  );
}
