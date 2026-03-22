/**
 * 電車コレクション定義
 * unlockAt = 累計読了冊数で解放
 */
export const TRAINS = [
  {
    id: 'yamanote',
    name: 'やまのてせん',
    nameKana: 'やまのてせん',
    series: 'E235系',
    image: '/trains/yamanote.webp',
    unlockAt: 1,
    rarity: 'normal',
    color: '#9acd32',
    description: 'とうきょうをぐるぐるまわるでんしゃだよ！',
  },
  {
    id: 'hayabusa',
    name: 'はやぶさ',
    nameKana: 'はやぶさ',
    series: 'E5系',
    image: '/trains/hayabusa.webp',
    unlockAt: 3,
    rarity: 'rare',
    color: '#00b16a',
    description: 'にほんでいちばんはやいしんかんせん！',
  },
  {
    id: 'komachi',
    name: 'こまち',
    nameKana: 'こまち',
    series: 'E6系',
    image: '/trains/komachi.webp',
    unlockAt: 5,
    rarity: 'rare',
    color: '#e74c3c',
    description: 'あきたにいくあかいしんかんせん！',
  },
  {
    id: 'kagayaki',
    name: 'かがやき',
    nameKana: 'かがやき',
    series: 'E7系/W7系',
    image: '/trains/kagayaki.webp',
    unlockAt: 8,
    rarity: 'super_rare',
    color: '#3498db',
    description: 'ほくりくをはしるきらきらしんかんせん！',
  },
  {
    id: 'doctor_yellow',
    name: 'ドクターイエロー',
    nameKana: 'どくたーいえろー',
    series: '923形',
    image: '/trains/doctor_yellow.webp',
    unlockAt: 10,
    rarity: 'legendary',
    color: '#f1c40f',
    description: 'みるとしあわせになれるきいろいしんかんせん！',
  },
];

/**
 * 駅データ
 * 各駅は特定の読了冊数で到達
 */
export const STATIONS = [
  { id: 1, name: 'はじまりえき', readCount: 0, x: 10, y: 80 },
  { id: 2, name: 'えほんまち', readCount: 1, x: 25, y: 65 },
  { id: 3, name: 'おはなしもり', readCount: 3, x: 40, y: 50 },
  { id: 4, name: 'わくわくはし', readCount: 5, x: 55, y: 40 },
  { id: 5, name: 'きらきらやま', readCount: 8, x: 70, y: 25 },
  { id: 6, name: 'しゃりょうきち', readCount: 10, x: 85, y: 15 },
];

/**
 * レアリティの表示名と色
 */
export const RARITY_CONFIG = {
  normal: { label: 'ノーマル', color: '#95a5a6', stars: 1 },
  rare: { label: 'レア', color: '#3498db', stars: 2 },
  super_rare: { label: 'スーパーレア', color: '#9b59b6', stars: 3 },
  legendary: { label: 'レジェンド', color: '#f39c12', stars: 4 },
};

/**
 * 現在の読了数で解放されている電車を取得
 */
export function getUnlockedTrains(totalReadCount) {
  return TRAINS.filter(t => t.unlockAt <= totalReadCount);
}

/**
 * 次に解放される電車を取得
 */
export function getNextTrain(totalReadCount) {
  return TRAINS.find(t => t.unlockAt > totalReadCount) || null;
}

/**
 * 現在到達している駅を取得
 */
export function getCurrentStation(totalReadCount) {
  const reached = STATIONS.filter(s => s.readCount <= totalReadCount);
  return reached[reached.length - 1] || STATIONS[0];
}
