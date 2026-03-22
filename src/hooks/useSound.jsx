import { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { useBookDB } from './useBookDB';
import { STATION_MELODIES, WHISTLE_SOUND, GACHA_SOUNDS } from '../utils/stationMelodies';

const SoundContext = createContext(null);

/**
 * SoundProvider: アプリ全体で共有されるAudioContext＋サウンド設定
 */
export function SoundProvider({ children }) {
  const ctxRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { getSetting, setSetting } = useBookDB();

  useEffect(() => {
    getSetting('soundEnabled').then((val) => {
      if (val !== undefined) setSoundEnabled(val);
    });
  }, []);

  const getContext = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playMelody = useCallback(async (notes) => {
    if (!soundEnabled) return;
    const ctx = getContext();
    let time = ctx.currentTime;

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type || 'sine';
      osc.frequency.setValueAtTime(note.freq, time);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + note.duration / 1000);
      time += note.duration / 1000;
    }

    return new Promise((resolve) => setTimeout(resolve, (time - ctx.currentTime) * 1000));
  }, [soundEnabled, getContext]);

  const playWhistle = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;
    const dur = WHISTLE_SOUND.duration / 1000;

    osc.frequency.setValueAtTime(WHISTLE_SOUND.startFreq, now);
    osc.frequency.linearRampToValueAtTime(WHISTLE_SOUND.endFreq, now + dur * 0.5);
    osc.frequency.linearRampToValueAtTime(WHISTLE_SOUND.startFreq, now + dur);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }, [soundEnabled, getContext]);

  const playStationArrival = useCallback((stationId) => {
    if (!soundEnabled) return;
    const melody = STATION_MELODIES[stationId];
    if (melody) {
      playWhistle();
      setTimeout(() => playMelody(melody), WHISTLE_SOUND.duration + 200);
    }
  }, [soundEnabled, playMelody, playWhistle]);

  const playGachaRoll = useCallback(() => {
    return playMelody(GACHA_SOUNDS.roll);
  }, [playMelody]);

  const playGachaReveal = useCallback((rarity) => {
    const key = `reveal_${rarity}`;
    const notes = GACHA_SOUNDS[key] || GACHA_SOUNDS.reveal_normal;
    return playMelody(notes);
  }, [playMelody]);

  const toggleSound = useCallback(async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    await setSetting('soundEnabled', next);
  }, [soundEnabled, setSetting]);

  const value = {
    playMelody,
    playWhistle,
    playStationArrival,
    playGachaRoll,
    playGachaReveal,
    soundEnabled,
    toggleSound,
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

/**
 * useSound: SoundContextからサウンド機能を取得
 */
export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return ctx;
}
