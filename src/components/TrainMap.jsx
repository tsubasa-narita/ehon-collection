import { useState, useEffect, useCallback } from 'react';
import { useBookDB } from '../hooks/useBookDB';
import { useVoice } from '../hooks/useVoice';
import { useSound } from '../hooks/useSound';
import { STATIONS, getUnlockedTrains, getNextTrain, getCurrentStation, RARITY_CONFIG } from '../utils/trainData';
import VoiceButton from './VoiceButton';
import './TrainMap.css';

export default function TrainMap({ refreshKey, showCollectionOnly = false }) {
  const [totalReadCount, setTotalReadCount] = useState(0);
  const [unlockedTrains, setUnlockedTrains] = useState([]);
  const [nextTrain, setNextTrain] = useState(null);
  const [showTrainDetail, setShowTrainDetail] = useState(null);
  const [treeShake, setTreeShake] = useState(null);
  const [cloudBounce, setCloudBounce] = useState(null);

  const { getTotalReadCount } = useBookDB();
  const { speak, playTrainSound, playSuccessSound } = useVoice();
  const { soundEnabled, toggleSound } = useSound();

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    const count = await getTotalReadCount();
    setTotalReadCount(count);
    setUnlockedTrains(getUnlockedTrains(count));
    setNextTrain(getNextTrain(count));
  };

  // Escape key to close modal
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && showTrainDetail) {
      setShowTrainDetail(null);
    }
  }, [showTrainDetail]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentStation = getCurrentStation(totalReadCount);
  
  // マップ上のアイコン（現在もっている中で一番レアな電車か、最新の電車）
  const latestTrain = unlockedTrains.length > 0 
    ? unlockedTrains[unlockedTrains.length - 1] 
    : { image: null, name: 'でんしゃ' };

  const handleTreeClick = (i) => {
    setTreeShake(i);
    if (soundEnabled) playSuccessSound(); // ｶｻｶｻ音の代わり
    setTimeout(() => setTreeShake(null), 1000);
  };

  const handleCloudClick = (i) => {
    setCloudBounce(i);
    if (soundEnabled) playTrainSound(); // ポワーオ音など
    setTimeout(() => setCloudBounce(null), 1000);
  };

  // 収集進捗
  const allTrains = getUnlockedTrains(Infinity);
  const progressPercent = Math.round((unlockedTrains.length / allTrains.length) * 100);

  return (
    <div className="train-map-page page">
      {/* Header */}
      <div className="map-header animate-fade-in">
        <h1 className="map-title">{showCollectionOnly ? '🏆 でんしゃずかん' : '🚂 でんしゃマップ'}</h1>
        <div className="map-header-right">
          <button
            className="sound-toggle-btn"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'おとをけす' : 'おとをだす'}
            title={soundEnabled ? 'おとをけす' : 'おとをだす'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <div className="map-counter">
            <span className="counter-number">{totalReadCount}</span>
            <span className="counter-label">さつ よんだよ！</span>
          </div>
        </div>
      </div>

      {/* Next goal */}
      {!showCollectionOnly && nextTrain && (
        <div className="next-goal animate-fade-in">
          <div className="goal-label">つぎのでんしゃまであと</div>
          <div className="goal-remaining">
            <span className="goal-number">{nextTrain.unlockAt - totalReadCount}</span>
            <span className="goal-unit">さつ!</span>
          </div>
          <div className="goal-train-name">🔒 {nextTrain.name}</div>
        </div>
      )}

      {/* Map (hidden in collection-only mode) */}
      {!showCollectionOnly && (
      <div className="map-container animate-fade-in" style={{ animationDelay: '100ms' }}>
        <svg viewBox="0 0 100 100" className="map-svg">
          {/* Sky gradient */}
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#87ceeb' }} />
              <stop offset="70%" style={{ stopColor: '#e3f2fd' }} />
              <stop offset="100%" style={{ stopColor: '#c8e6c9' }} />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#skyGrad)" rx="3" />

          {/* Clouds */}
          <ellipse 
            cx="15" cy="12" rx="8" ry="4" fill="white" opacity="0.7" 
            onClick={() => handleCloudClick(1)}
            className={`map-interactive ${cloudBounce === 1 ? 'cloud-bounce' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse 
            cx="75" cy="20" rx="10" ry="5" fill="white" opacity="0.6"
            onClick={() => handleCloudClick(2)}
            className={`map-interactive ${cloudBounce === 2 ? 'cloud-bounce' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <animateTransform attributeName="transform" type="translate" values="0,0;-2,0;0,0" dur="10s" repeatCount="indefinite" />
          </ellipse>

          {/* Ground */}
          <rect x="0" y="85" width="100" height="15" fill="#c8e6c9" rx="0" />

          {/* Track line */}
          {STATIONS.map((station, i) => {
            if (i === 0) return null;
            const prev = STATIONS[i - 1];
            const reached = station.readCount <= totalReadCount;
            return (
              <line
                key={`track-${i}`}
                x1={prev.x}
                y1={prev.y}
                x2={station.x}
                y2={station.y}
                stroke={reached ? '#5d4037' : '#ccc'}
                strokeWidth={reached ? 2 : 1}
                strokeDasharray={reached ? 'none' : '2,2'}
              />
            );
          })}

          {/* Track ties */}
          {STATIONS.map((station, i) => {
            if (i === 0) return null;
            const prev = STATIONS[i - 1];
            const reached = station.readCount <= totalReadCount;
            if (!reached) return null;
            const ties = [];
            const steps = 5;
            for (let t = 1; t < steps; t++) {
              const ratio = t / steps;
              const tx = prev.x + (station.x - prev.x) * ratio;
              const ty = prev.y + (station.y - prev.y) * ratio;
              const angle = Math.atan2(station.y - prev.y, station.x - prev.x) * (180 / Math.PI) + 90;
              ties.push(
                <line
                  key={`tie-${i}-${t}`}
                  x1={tx - 1.5 * Math.cos(angle * Math.PI / 180)}
                  y1={ty - 1.5 * Math.sin(angle * Math.PI / 180)}
                  x2={tx + 1.5 * Math.cos(angle * Math.PI / 180)}
                  y2={ty + 1.5 * Math.sin(angle * Math.PI / 180)}
                  stroke="#8d6e63"
                  strokeWidth="0.5"
                />
              );
            }
            return ties;
          })}

          {/* Stations */}
          {STATIONS.map((station) => {
            const reached = station.readCount <= totalReadCount;
            const isCurrent = station.id === currentStation.id;
            return (
              <g key={station.id}>
                {/* Station dot */}
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={isCurrent ? 4 : 3}
                  fill={reached ? '#66bb6a' : '#e0e0e0'}
                  stroke={isCurrent ? '#2e7d32' : reached ? '#43a047' : '#bdbdbd'}
                  strokeWidth={isCurrent ? 1.5 : 0.8}
                >
                  {isCurrent && (
                    <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
                  )}
                </circle>
                {/* Station name */}
                <text
                  x={station.x}
                  y={station.y - 6}
                  textAnchor="middle"
                  fontSize="3"
                  fontWeight="bold"
                  fill={reached ? '#37474f' : '#bdbdbd'}
                  fontFamily="Zen Maru Gothic, sans-serif"
                >
                  {station.name}
                </text>
                {/* Train icon at current station */}
                {isCurrent && (
                  latestTrain.image ? (
                    <image 
                      href={latestTrain.image}
                      x={station.x + 1}
                      y={station.y - 4}
                      width="8"
                      height="8"
                      className="map-moving-train"
                    />
                  ) : (
                    <text
                      x={station.x + 5}
                      y={station.y + 1.5}
                      fontSize="5"
                      textAnchor="middle"
                      className="map-moving-train"
                    >
                      🚂
                    </text>
                  )
                )}
              </g>
            );
          })}

          {/* Decorative trees */}
          {[18, 45, 72, 88].map((x, i) => (
            <g 
              key={`tree-${i}`} 
              onClick={() => handleTreeClick(i)}
              className={`map-interactive ${treeShake === i ? 'tree-shake' : ''}`}
              style={{ cursor: 'pointer', transformOrigin: `${x}px 85px` }}
            >
              <rect x={x - 0.5} y={84} width={1} height={3} fill="#795548" />
              <circle cx={x} cy={83} r={2.5} fill="#66bb6a" />
            </g>
          ))}
        </svg>
      </div>
      )}

      {/* Train collection */}
      <div className="train-collection animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="collection-title">
          <span className="collection-icon">🏆</span> 
          でんしゃコレクション
        </h2>
        
        {/* Progress Bar */}
        <div className="collection-progress">
          <div className="progress-info">
            <span className="progress-text">{allTrains.length} しゅるい ちゅう</span>
            <span className="progress-count">
              <span className="progress-current">{unlockedTrains.length}</span> しゅるい あつめたよ！
            </span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="train-grid">
          {getUnlockedTrains(Infinity).map((train) => {
            const isUnlocked = train.unlockAt <= totalReadCount;
            const rarity = RARITY_CONFIG[train.rarity];
            return (
              <VoiceButton
                key={train.id}
                className={`train-item ${isUnlocked ? 'train-unlocked' : 'train-locked'}`}
                voiceText={isUnlocked ? `${train.name}、${train.description}` : `${train.name}はまだロックされています。あと${train.unlockAt - totalReadCount}さつよむとゲットできるよ！`}
                onClick={() => isUnlocked && setShowTrainDetail(train)}
              >
                <div className="train-image-wrap glass-card">
                  {isUnlocked ? (
                    <img src={train.image} alt={train.name} className="train-image" />
                  ) : (
                    <div className="train-silhouette-wrap">
                      <img src={train.image} alt="???" className="train-image train-silhouette" />
                      <div className="train-silhouette-overlay">🔒</div>
                    </div>
                  )}
                </div>
                <span className="train-name">{isUnlocked ? train.name : '???'}</span>
                <div className="train-stars">
                  {Array.from({ length: rarity.stars }).map((_, i) => (
                    <span key={i} style={{ color: isUnlocked ? rarity.color : '#ccc' }}>⭐</span>
                  ))}
                </div>
              </VoiceButton>
            );
          })}
        </div>
      </div>

      {/* Train detail modal */}
      {showTrainDetail && (
        <div className="train-modal-overlay" onClick={() => setShowTrainDetail(null)}>
          <div className="train-modal animate-bounce-in" onClick={e => e.stopPropagation()}>
            <img src={showTrainDetail.image} alt={showTrainDetail.name} className="train-modal-image" />
            <h3 className="train-modal-name">{showTrainDetail.name}</h3>
            <p className="train-modal-series">{showTrainDetail.series}</p>
            <p className="train-modal-desc">{showTrainDetail.description}</p>
            <div className="train-modal-rarity" style={{ color: RARITY_CONFIG[showTrainDetail.rarity].color }}>
              {Array.from({ length: RARITY_CONFIG[showTrainDetail.rarity].stars }).map((_, i) => (
                <span key={i}>⭐</span>
              ))}
              {' '}{RARITY_CONFIG[showTrainDetail.rarity].label}
            </div>
            <VoiceButton
              className="btn-primary"
              voiceText={`${showTrainDetail.name}、${showTrainDetail.description}`}
              onClick={() => setShowTrainDetail(null)}
            >
              とじる
            </VoiceButton>
          </div>
        </div>
      )}
    </div>
  );
}
