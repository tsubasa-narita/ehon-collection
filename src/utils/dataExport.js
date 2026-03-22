/**
 * データエクスポート・インポートユーティリティ
 */

const EXPORT_VERSION = 1;
const APP_ID = 'ehon-collection';

/**
 * エクスポート用JSONを生成
 */
export function createExportData(books, settings) {
  return {
    version: EXPORT_VERSION,
    app: APP_ID,
    exportedAt: new Date().toISOString(),
    books: books.map(({ id, ...rest }) => rest), // idは除外（インポート時に再採番）
    settings,
  };
}

/**
 * エクスポートデータをファイルとしてダウンロード
 */
export function downloadExportFile(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ehon-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Web Share APIでシェア（対応端末のみ）
 */
export async function shareExportData(data) {
  const json = JSON.stringify(data, null, 2);
  const file = new File([json], `ehon-backup-${new Date().toISOString().slice(0, 10)}.json`, {
    type: 'application/json',
  });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: 'えほんコレクション バックアップ',
      files: [file],
    });
    return true;
  }
  return false;
}

/**
 * インポートデータのバリデーション
 */
export function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, bookCount: 0, error: 'データがよめません' };
  }
  if (data.app !== APP_ID) {
    return { valid: false, bookCount: 0, error: 'えほんコレクションのデータではありません' };
  }
  if (data.version !== EXPORT_VERSION) {
    return { valid: false, bookCount: 0, error: 'データのバージョンがあいません' };
  }
  if (!Array.isArray(data.books)) {
    return { valid: false, bookCount: 0, error: 'えほんデータがみつかりません' };
  }
  for (const book of data.books) {
    if (!book.title) {
      return { valid: false, bookCount: 0, error: 'タイトルのないえほんがあります' };
    }
    // coverUrlのサニタイズ: http(s)のみ許可
    if (book.coverUrl && !/^https?:\/\//i.test(book.coverUrl)) {
      book.coverUrl = '';
    }
  }
  return { valid: true, bookCount: data.books.length, error: null };
}

/**
 * JSONファイルを読み込む
 */
export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch {
        reject(new Error('JSONファイルがよめません'));
      }
    };
    reader.onerror = () => reject(new Error('ファイルがよめません'));
    reader.readAsText(file);
  });
}
