import { useState, useEffect, useRef } from 'react';
import { RARITY_CONFIG } from '../utils/trainData';
import { useSound } from '../hooks/useSound';
import { useVoice } from '../hooks/useVoice';
import './GachaAnimation.css';

/**
 * ガチャ演出コンポーネント
 * 電車アンロック時のカプセル→開封→お披露目アニメーション
 */
export default function GachaAnimation({ train, onComplete }) {
  const [phase, setPhase] = useState('capsule'); // capsule → opening → reveal
  const { playGachaRoll, playGachaReveal } = useSound();
  const { speak } = useVoice();
  const rarity = RARITY_CONFIG[train.rarity];
  const completedRef = useRef(false);

  const handleComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  // Escape key to skip/close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && phase === 'reveal') {
        handleComplete();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  useEffect(() => {
    playGachaRoll();

    const timer1 = setTimeout(() => {
      setPhase('opening');
    }, 1200);

    const timer2 = setTimeout(() => {
      setPhase('reveal');
      playGachaReveal(train.rarity);
      speak(`${train.name}をゲットしたよ！`);
    }, 2000);

    const timer3 = setTimeout(() => {
      handleComplete();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
    // train/onCompleteは初回マウント時のみ使用（アニメーション中は変わらない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sparkleCount = train.rarity === 'legendary' ? 20
    : train.rarity === 'super_rare' ? 12
    : train.rarity === 'rare' ? 8 : 4;

  return (
    <div className="gacha-overlay" onClick={() => phase === 'reveal' && handleComplete()}>
      {/* Background effects based on rarity */}
      <div className={`gacha-bg gacha-bg-${train.rarity}`} />

      {/* Capsule phase */}
      {phase === 'capsule' && (
        <div className="gacha-capsule-container">
          <div className="gacha-capsule" style={{ '--capsule-color': train.color }}>
            <div className="gacha-capsule-top" />
            <div className="gacha-capsule-line" />
            <div className="gacha-capsule-bottom" />
          </div>
          <p className="gacha-text-hint">なにがでるかな...？</p>
        </div>
      )}

      {/* Opening phase */}
      {phase === 'opening' && (
        <div className="gacha-opening">
          <div className="gacha-flash" style={{ '--flash-color': rarity.color }} />
          <div className="gacha-capsule-half gacha-half-left" style={{ '--capsule-color': train.color }} />
          <div className="gacha-capsule-half gacha-half-right" style={{ '--capsule-color': train.color }} />
        </div>
      )}

      {/* Reveal phase */}
      {phase === 'reveal' && (
        <div className="gacha-reveal">
          {/* Sparkles */}
          {Array.from({ length: sparkleCount }).map((_, i) => (
            <span
              key={i}
              className="gacha-sparkle"
              style={{
                '--angle': `${(360 / sparkleCount) * i}deg`,
                '--delay': `${Math.random() * 0.5}s`,
                '--distance': `${80 + Math.random() * 60}px`,
                color: rarity.color,
              }}
            >
              ✦
            </span>
          ))}

          {/* Train card */}
          <div className={`gacha-train-card gacha-card-${train.rarity}`}>
            <div className="gacha-rarity-label" style={{ color: rarity.color }}>
              {Array.from({ length: rarity.stars }).map((_, i) => (
                <span key={i}>⭐</span>
              ))}
              <span className="gacha-rarity-text">{rarity.label}</span>
            </div>
            <img src={train.image} alt={train.name} className="gacha-train-image" />
            <h2 className="gacha-train-name">{train.name}</h2>
            <p className="gacha-train-series">{train.series}</p>
            <p className="gacha-train-desc">{train.description}</p>
          </div>

          <p className="gacha-tap-hint">タップしてとじる</p>
        </div>
      )}
    </div>
  );
}
