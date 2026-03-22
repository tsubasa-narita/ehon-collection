import { useState, useMemo } from 'react';
import {
  getWeeklyData,
  getMonthlyData,
  getCurrentStreak,
  getThisWeekTotal,
  getThisMonthTotal,
  getAllTimeTotal,
  getWeekStart,
} from '../utils/statsHelper';
import './ReadingReport.css';

export default function ReadingReport({ readingData }) {
  const [viewMode, setViewMode] = useState('weekly');

  // 日付キーを安定させてuseMemoの無駄な再計算を防ぐ
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const weeklyData = useMemo(() => {
    const weekStart = getWeekStart(new Date());
    return getWeeklyData(readingData, weekStart);
  }, [readingData, dateKey]);
  const monthlyData = useMemo(() => getMonthlyData(readingData, now.getFullYear(), now.getMonth()), [readingData, dateKey]);
  const streak = useMemo(() => getCurrentStreak(readingData), [readingData, dateKey]);
  const thisWeek = useMemo(() => getThisWeekTotal(readingData), [readingData, dateKey]);
  const thisMonth = useMemo(() => getThisMonthTotal(readingData), [readingData, dateKey]);
  const allTime = useMemo(() => getAllTimeTotal(readingData), [readingData, dateKey]);

  const chartData = viewMode === 'weekly' ? weeklyData : monthlyData;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="report">
      {/* Summary cards */}
      <div className="report-summary">
        <div className="report-stat-card">
          <span className="report-stat-emoji">📖</span>
          <span className="report-stat-number">{thisWeek}</span>
          <span className="report-stat-label">こんしゅう</span>
        </div>
        <div className="report-stat-card">
          <span className="report-stat-emoji">🔥</span>
          <span className="report-stat-number">{streak}</span>
          <span className="report-stat-label">れんぞく</span>
        </div>
        <div className="report-stat-card">
          <span className="report-stat-emoji">🏆</span>
          <span className="report-stat-number">{allTime}</span>
          <span className="report-stat-label">ぜんぶ</span>
        </div>
      </div>

      {/* Toggle */}
      <div className="report-toggle">
        <button
          className={`report-toggle-btn ${viewMode === 'weekly' ? 'report-toggle-active' : ''}`}
          onClick={() => setViewMode('weekly')}
        >
          しゅう
        </button>
        <button
          className={`report-toggle-btn ${viewMode === 'monthly' ? 'report-toggle-active' : ''}`}
          onClick={() => setViewMode('monthly')}
        >
          つき
        </button>
      </div>

      {/* Bar chart */}
      <div className="report-chart">
        {chartData.map((item, i) => (
          <div key={i} className="report-bar-row">
            <span className="report-bar-label">{item.label}</span>
            <div className="report-bar-track">
              <div
                className="report-bar-fill"
                style={{
                  width: item.count > 0 ? `${Math.max((item.count / maxCount) * 100, 8)}%` : '0%',
                  animationDelay: `${i * 80}ms`,
                }}
              />
            </div>
            <span className="report-bar-count">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Monthly total */}
      <div className="report-footer">
        <span className="report-footer-label">こんげつのごうけい</span>
        <span className="report-footer-number">{thisMonth} さつ</span>
      </div>
    </div>
  );
}
