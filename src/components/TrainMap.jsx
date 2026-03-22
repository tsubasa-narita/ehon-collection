import { useState, useEffect } from 'react';
import { useBookDB } from '../hooks/useBookDB';
import { useVoice } from '../hooks/useVoice';
import { STATIONS, getUnlockedTrains, getNextTrain, getCurrentStation, RARITY_CONFIG } from '../utils/trainData';
import VoiceButton from './VoiceButton';
import './TrainMap.css';

export default function TrainMap({ refreshKey }) {
  const [totalReadCount, setTotalReadCount] = useState(0);
  const [unlockedTrains, setUnlockedTrains] = useState([]);
  const [nextTrain, setNextTrain] = useState(null);
  const [showTrainDetail, setShowTrainDetail] = useState(null);
  const { getTotalReadCount } = useBookDB();
  const { speak } = useVoice();

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    const count = await getTotalReadCount();
    setTotalReadCount(count);
    setUnlockedTrains(getUnlockedTrains(count));
    setNextTrain(getNextTrain(count));
  };

  const currentStation = getCurrentStation(totalReadCount);

  return (
    <div className="train-map-page page">
      {/* Header */}
      <div className="map-header animate-fade-in">
        <h1 className="map-title">🚂 でんしゃマップ</h1>
        <div className="map-counter">
          <span className="counter-number">{totalReadCount}</span>
          <span className="counter-label">さつ よんだよ！</span>
        </div>
      </div>

      {/* Next goal */}
      {nextTrain && (
        <div className="next-goal animate-fade-in">
          <div className="goal-label">つぎのでんしゃまであと</div>
          <div className="goal-remaining">
            <span className="goal-number">{nextTrain.unlockAt - totalReadCount}</span>
            <span className="goal-unit">さつ!</span>
          </div>
          <div className="goal-train-name">🔒 {nextTrain.name}</div>
        </div>
      )}

      {/* Map */}
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
          <ellipse cx="15" cy="12" rx="8" ry="4" fill="white" opacity="0.7">
            <animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="75" cy="20" rx="10" ry="5" fill="white" opacity="0.6">
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
                  <text
                    x={station.x + 5}
                    y={station.y + 1.5}
                    fontSize="5"
                    textAnchor="middle"
                  >
                    🚂
                  </text>
                )}
              </g>
            );
          })}

          {/* Decorative trees */}
          {[18, 45, 72, 88].map((x, i) => (
            <g key={`tree-${i}`}>
              <rect x={x - 0.5} y={84} width={1} height={3} fill="#795548" />
              <circle cx={x} cy={83} r={2.5} fill="#66bb6a" />
            </g>
          ))}
        </svg>
      </div>

      {/* Train collection */}
      <div className="train-collection animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="collection-title">🏆 でんしゃコレクション</h2>
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
                <div className="train-image-wrap">
                  {isUnlocked ? (
                    <img src={train.image} alt={train.name} className="train-image" />
                  ) : (
                    <div className="train-image train-image-locked">🔒</div>
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
