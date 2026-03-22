import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { fetchBookInfo } from '../utils/bookApi';
import { useBookDB } from '../hooks/useBookDB';
import { useVoice } from '../hooks/useVoice';
import './BarcodeScanner.css';

export default function BarcodeScanner({ onBookAdded, onClose }) {
  const [mode, setMode] = useState('scan'); // 'scan' | 'manual' | 'result'
  const [manualIsbn, setManualIsbn] = useState('');
  const [bookInfo, setBookInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const { addBook, getBookByIsbn } = useBookDB();
  const { speak } = useVoice();

  useEffect(() => {
    if (mode === 'scan') {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [mode]);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    try {
      const scanner = new Html5Qrcode('barcode-reader');
      scannerInstanceRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {} // ignore scan errors
      );
      setScannerReady(true);
    } catch (err) {
      console.warn('Camera not available:', err);
      setMode('manual');
    }
  };

  const stopScanner = async () => {
    if (scannerInstanceRef.current) {
      try {
        const state = scannerInstanceRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerInstanceRef.current.stop();
        }
      } catch (e) {
        // ignore
      }
      scannerInstanceRef.current = null;
    }
    setScannerReady(false);
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();
    speak('バーコードをよみとりました！');
    await lookupBook(decodedText);
  };

  const lookupBook = async (isbn) => {
    setLoading(true);
    setError('');
    setBookInfo(null);

    try {
      // Check if already registered
      const existing = await getBookByIsbn(isbn);
      if (existing) {
        setError('このえほんはもうとうろくされています');
        speak('このえほんはもうとうろくされています');
        setLoading(false);
        return;
      }

      const info = await fetchBookInfo(isbn);
      if (info) {
        setBookInfo(info);
        setMode('result');
        speak(`${info.title} がみつかりました！`);
      } else {
        setError('えほんのじょうほうがみつかりませんでした');
        speak('えほんがみつかりませんでした');
      }
    } catch (e) {
      setError('ネットワークエラーが発生しました');
    }
    setLoading(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualIsbn.trim()) {
      lookupBook(manualIsbn.trim());
    }
  };

  const handleRegister = async () => {
    if (!bookInfo) return;
    setLoading(true);
    try {
      const newBook = await addBook(bookInfo);
      speak(`${bookInfo.title} をとうろくしました！`);
      if (onBookAdded) onBookAdded(newBook);
    } catch (e) {
      setError('登録に失敗しました');
    }
    setLoading(false);
  };

  const handleRetry = () => {
    setBookInfo(null);
    setError('');
    setManualIsbn('');
    setMode('scan');
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-container animate-fade-in">
        <div className="scanner-header">
          <h2 className="scanner-title">📷 えほんをとうろく</h2>
          <button className="scanner-close" onClick={onClose} aria-label="閉じる">
            ✕
          </button>
        </div>

        {mode === 'scan' && (
          <div className="scanner-body">
            <div className="scanner-viewfinder" ref={scannerRef}>
              <div id="barcode-reader" />
              {!scannerReady && (
                <div className="scanner-loading">
                  <div className="spinner" />
                  <p>カメラをじゅんびちゅう...</p>
                </div>
              )}
            </div>
            <p className="scanner-hint">えほんのバーコードをカメラにうつしてね</p>
            <button
              className="btn-ghost scanner-manual-btn"
              onClick={() => { stopScanner(); setMode('manual'); }}
            >
              ⌨️ ばんごうをてでいれる
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="scanner-body">
            <form onSubmit={handleManualSubmit} className="manual-form">
              <label className="manual-label" htmlFor="isbn-input">
                ISBN（バーコードのしたのばんごう）
              </label>
              <input
                id="isbn-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9\-]*"
                placeholder="978-4-..."
                value={manualIsbn}
                onChange={(e) => setManualIsbn(e.target.value)}
                className="manual-input"
                autoFocus
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={!manualIsbn.trim() || loading}
              >
                {loading ? '🔍 けんさくちゅう...' : '🔍 けんさくする'}
              </button>
            </form>
            <button className="btn-ghost" onClick={handleRetry}>
              📷 カメラでよみとる
            </button>
          </div>
        )}

        {mode === 'result' && bookInfo && (
          <div className="scanner-body">
            <div className="book-preview animate-bounce-in">
              {bookInfo.coverUrl ? (
                <img
                  src={bookInfo.coverUrl}
                  alt={bookInfo.title}
                  className="preview-cover"
                />
              ) : (
                <div className="preview-cover preview-cover-placeholder">
                  📚
                </div>
              )}
              <div className="preview-info">
                <h3 className="preview-title">{bookInfo.title}</h3>
                <p className="preview-author">{bookInfo.author}</p>
                <p className="preview-publisher">{bookInfo.publisher}</p>
              </div>
            </div>
            <div className="result-actions">
              <button
                className="btn-success"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? '📝 とうろくちゅう...' : '✅ とうろくする！'}
              </button>
              <button className="btn-ghost" onClick={handleRetry}>
                🔄 もういちどスキャン
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="scanner-error animate-shake">
            <p>⚠️ {error}</p>
            <button className="btn-ghost" onClick={handleRetry}>やりなおす</button>
          </div>
        )}
      </div>
    </div>
  );
}
