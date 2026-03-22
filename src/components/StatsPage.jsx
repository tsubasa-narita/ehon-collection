import { useState, useEffect } from 'react';
import { useBookDB } from '../hooks/useBookDB';
import ReadingCalendar from './ReadingCalendar';
import ReadingReport from './ReadingReport';
import DataSync from './DataSync';
import ReminderSettings from './ReminderSettings';
import './StatsPage.css';

export default function StatsPage({ refreshKey }) {
  const [readingData, setReadingData] = useState(new Map());
  const { getReadingDataByDate } = useBookDB();

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = async () => {
    const data = await getReadingDataByDate();
    setReadingData(data);
  };

  return (
    <div className="stats-page page">
      <h1 className="stats-page-title animate-fade-in">📊 きろく</h1>

      <div className="stats-section animate-fade-in">
        <h2 className="stats-section-title">📅 カレンダー</h2>
        <ReadingCalendar readingData={readingData} />
      </div>

      <div className="stats-section animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h2 className="stats-section-title">📈 レポート</h2>
        <ReadingReport readingData={readingData} />
      </div>

      <div className="stats-section animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="stats-section-title">🔔 リマインダー</h2>
        <ReminderSettings />
      </div>

      <div className="stats-section animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h2 className="stats-section-title">💾 データ</h2>
        <DataSync onDataChanged={loadData} />
      </div>
    </div>
  );
}
