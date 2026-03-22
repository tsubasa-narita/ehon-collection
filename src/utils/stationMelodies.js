/**
 * 駅ごとの発車メロディデータ
 * freq: 周波数(Hz), duration: 長さ(ms), type: オシレータータイプ
 */

// C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494, C5=523, D5=587, E5=659, G5=784

export const STATION_MELODIES = {
  // はじまりえき - シンプルな上昇音階
  1: [
    { freq: 262, duration: 200, type: 'sine' },
    { freq: 330, duration: 200, type: 'sine' },
    { freq: 392, duration: 200, type: 'sine' },
    { freq: 523, duration: 400, type: 'sine' },
  ],
  // えほんまち - 明るいアルペジオ
  2: [
    { freq: 262, duration: 150, type: 'sine' },
    { freq: 330, duration: 150, type: 'sine' },
    { freq: 392, duration: 150, type: 'sine' },
    { freq: 523, duration: 150, type: 'sine' },
    { freq: 659, duration: 300, type: 'sine' },
  ],
  // おはなしもり - ペンタトニック（森の雰囲気）
  3: [
    { freq: 392, duration: 200, type: 'triangle' },
    { freq: 440, duration: 150, type: 'triangle' },
    { freq: 523, duration: 200, type: 'triangle' },
    { freq: 440, duration: 150, type: 'triangle' },
    { freq: 523, duration: 150, type: 'triangle' },
    { freq: 659, duration: 400, type: 'triangle' },
  ],
  // わくわくはし - テンポ速め、わくわく感
  4: [
    { freq: 523, duration: 120, type: 'sine' },
    { freq: 587, duration: 120, type: 'sine' },
    { freq: 659, duration: 120, type: 'sine' },
    { freq: 784, duration: 120, type: 'sine' },
    { freq: 659, duration: 120, type: 'sine' },
    { freq: 784, duration: 120, type: 'sine' },
    { freq: 1047, duration: 400, type: 'sine' },
  ],
  // きらきらやま - キラキラ高音トレモロ
  5: [
    { freq: 784, duration: 100, type: 'sine' },
    { freq: 1047, duration: 100, type: 'sine' },
    { freq: 784, duration: 100, type: 'sine' },
    { freq: 1047, duration: 100, type: 'sine' },
    { freq: 784, duration: 100, type: 'sine' },
    { freq: 1047, duration: 100, type: 'sine' },
    { freq: 1319, duration: 500, type: 'sine' },
  ],
  // しゃりょうきち - グランドフィナーレ
  6: [
    { freq: 262, duration: 150, type: 'sine' },
    { freq: 330, duration: 150, type: 'sine' },
    { freq: 392, duration: 150, type: 'sine' },
    { freq: 523, duration: 200, type: 'sine' },
    { freq: 659, duration: 200, type: 'sine' },
    { freq: 784, duration: 200, type: 'sine' },
    { freq: 1047, duration: 200, type: 'sine' },
    { freq: 1319, duration: 600, type: 'sine' },
  ],
};

/** 汽笛サウンド定義 */
export const WHISTLE_SOUND = {
  startFreq: 800,
  endFreq: 1200,
  duration: 600,
};

/** ガチャ演出用サウンド */
export const GACHA_SOUNDS = {
  roll: [
    { freq: 200, duration: 80, type: 'square' },
    { freq: 250, duration: 80, type: 'square' },
    { freq: 200, duration: 80, type: 'square' },
    { freq: 250, duration: 80, type: 'square' },
    { freq: 300, duration: 80, type: 'square' },
    { freq: 350, duration: 80, type: 'square' },
  ],
  reveal_normal: [
    { freq: 523, duration: 200, type: 'sine' },
    { freq: 659, duration: 200, type: 'sine' },
    { freq: 784, duration: 400, type: 'sine' },
  ],
  reveal_rare: [
    { freq: 523, duration: 150, type: 'sine' },
    { freq: 659, duration: 150, type: 'sine' },
    { freq: 784, duration: 150, type: 'sine' },
    { freq: 1047, duration: 400, type: 'sine' },
  ],
  reveal_super_rare: [
    { freq: 392, duration: 120, type: 'sine' },
    { freq: 523, duration: 120, type: 'sine' },
    { freq: 659, duration: 120, type: 'sine' },
    { freq: 784, duration: 120, type: 'sine' },
    { freq: 1047, duration: 120, type: 'sine' },
    { freq: 1319, duration: 500, type: 'sine' },
  ],
  reveal_legendary: [
    { freq: 262, duration: 100, type: 'sine' },
    { freq: 330, duration: 100, type: 'sine' },
    { freq: 392, duration: 100, type: 'sine' },
    { freq: 523, duration: 100, type: 'sine' },
    { freq: 659, duration: 100, type: 'sine' },
    { freq: 784, duration: 100, type: 'sine' },
    { freq: 1047, duration: 100, type: 'sine' },
    { freq: 1319, duration: 200, type: 'sine' },
    { freq: 1568, duration: 600, type: 'sine' },
  ],
};
