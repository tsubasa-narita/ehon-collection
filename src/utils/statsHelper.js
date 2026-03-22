/**
 * 読書統計ヘルパー関数
 */

/**
 * 週間データを取得 (指定週の日〜土)
 * @param {Map<string, Array>} readingData - 日付→書籍配列のMap
 * @param {Date} weekStartDate - 週の開始日(日曜日)
 * @returns {Array<{label: string, date: string, count: number}>}
 */
export function getWeeklyData(readingData, weekStartDate) {
  const dayLabels = ['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど'];
  const result = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + i);
    const dateKey = formatDateKey(d);
    const books = readingData.get(dateKey) || [];
    result.push({
      label: dayLabels[i],
      date: dateKey,
      count: books.length,
    });
  }
  return result;
}

/**
 * 月間データを取得 (週ごとの集計)
 * @param {Map<string, Array>} readingData
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Array<{label: string, count: number}>}
 */
export function getMonthlyData(readingData, year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  let weekCount = 0;
  let currentCount = 0;

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dateKey = formatDateKey(date);
    const books = readingData.get(dateKey) || [];
    currentCount += books.length;

    if (date.getDay() === 6 || d === lastDay.getDate()) {
      weekCount++;
      weeks.push({
        label: `${weekCount}しゅうめ`,
        count: currentCount,
      });
      currentCount = 0;
    }
  }
  return weeks;
}

/**
 * 連続読書日数 (今日から遡って)
 */
export function getCurrentStreak(readingData) {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = formatDateKey(d);
    if (readingData.has(dateKey)) {
      streak++;
    } else {
      if (i === 0) continue; // 今日まだ読んでなくてもOK
      break;
    }
  }
  return streak;
}

/**
 * 今週の合計
 */
export function getThisWeekTotal(readingData) {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  let total = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateKey = formatDateKey(d);
    total += (readingData.get(dateKey) || []).length;
  }
  return total;
}

/**
 * 今月の合計
 */
export function getThisMonthTotal(readingData) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  let total = 0;

  for (let d = 1; d <= lastDay; d++) {
    const dateKey = formatDateKey(new Date(year, month, d));
    total += (readingData.get(dateKey) || []).length;
  }
  return total;
}

/**
 * 全期間合計
 */
export function getAllTimeTotal(readingData) {
  let total = 0;
  for (const books of readingData.values()) {
    total += books.length;
  }
  return total;
}

/**
 * 指定日を含む週の日曜日を取得
 */
export function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * カレンダーグリッド生成
 * @returns {Array<{date: Date|null, dayOfMonth: number|null}>}
 */
export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sunday
  const days = [];

  // 前月パディング
  for (let i = 0; i < startDow; i++) {
    days.push({ date: null, dayOfMonth: null });
  }

  // 当月
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({
      date: new Date(year, month, d),
      dayOfMonth: d,
    });
  }

  return days;
}

/**
 * Date → 'YYYY-MM-DD'
 */
export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
