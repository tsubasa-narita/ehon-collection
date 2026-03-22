import { useState, useRef } from 'react';
import { useBookDB } from '../hooks/useBookDB';
import { createExportData, downloadExportFile, shareExportData, validateImportData, readJsonFile } from '../utils/dataExport';
import './DataSync.css';

export default function DataSync({ onDataChanged }) {
  const [exportStatus, setExportStatus] = useState(null);
  const [importStatus, setImportStatus] = useState(null); // null | 'preview' | 'importing' | 'done'
  const [importPreview, setImportPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const { exportAllData, importData } = useBookDB();

  const handleExport = async () => {
    try {
      const { books, settings } = await exportAllData();
      const data = createExportData(books, settings);

      // Web Share APIを試す
      const shared = await shareExportData(data).catch(() => false);
      if (!shared) {
        downloadExportFile(data);
      }

      setExportStatus(`${books.length}さつのデータをほぞんしました！`);
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus('ほぞんにしっぱいしました');
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await readJsonFile(file);
      const validation = validateImportData(data);

      if (!validation.valid) {
        setImportStatus('done');
        setImportResult({ success: false, message: validation.error });
        return;
      }

      setImportPreview(data);
      setImportStatus('preview');
    } catch (err) {
      setImportStatus('done');
      setImportResult({ success: false, message: err.message });
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async (mode) => {
    if (!importPreview) return;
    setImportStatus('importing');

    try {
      const count = await importData(importPreview, mode);
      setImportStatus('done');
      setImportResult({ success: true, message: `${count}さつのデータをよみこみました！` });
      setImportPreview(null);
      if (onDataChanged) onDataChanged();
    } catch {
      setImportStatus('done');
      setImportResult({ success: false, message: 'よみこみにしっぱいしました' });
    }

    setTimeout(() => {
      setImportStatus(null);
      setImportResult(null);
    }, 3000);
  };

  const cancelImport = () => {
    setImportStatus(null);
    setImportPreview(null);
    setImportResult(null);
  };

  return (
    <div className="data-sync">
      {/* Export */}
      <div className="sync-section">
        <div className="sync-section-header">
          <span className="sync-icon">📤</span>
          <span className="sync-label">データのほぞん</span>
        </div>
        <button className="btn-primary sync-btn" onClick={handleExport}>
          💾 ほぞんする
        </button>
        {exportStatus && (
          <p className="sync-message animate-fade-in">{exportStatus}</p>
        )}
      </div>

      <div className="sync-divider" />

      {/* Import */}
      <div className="sync-section">
        <div className="sync-section-header">
          <span className="sync-icon">📥</span>
          <span className="sync-label">データのよみこみ</span>
        </div>

        {!importStatus && (
          <>
            <button
              className="btn-primary sync-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📂 ファイルをえらぶ
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="sr-only"
            />
          </>
        )}

        {importStatus === 'preview' && importPreview && (
          <div className="sync-preview animate-fade-in">
            <p className="sync-preview-text">
              {importPreview.books.length}さつのデータがみつかりました
            </p>
            <div className="sync-preview-actions">
              <button className="btn-primary sync-btn-sm" onClick={() => handleImport('merge')}>
                🔄 まぜる
              </button>
              <button
                className="btn-accent sync-btn-sm"
                onClick={() => {
                  if (window.confirm('いまのデータはぜんぶきえます。よろしいですか？')) {
                    handleImport('replace');
                  }
                }}
              >
                📝 おきかえる
              </button>
              <button className="btn-ghost sync-btn-sm" onClick={cancelImport}>
                もどる
              </button>
            </div>
          </div>
        )}

        {importStatus === 'importing' && (
          <p className="sync-message animate-fade-in">よみこみちゅう...</p>
        )}

        {importStatus === 'done' && importResult && (
          <p className={`sync-message animate-fade-in ${importResult.success ? '' : 'sync-error'}`}>
            {importResult.message}
          </p>
        )}
      </div>
    </div>
  );
}
