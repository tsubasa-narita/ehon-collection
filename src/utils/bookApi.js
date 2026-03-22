/**
 * openBD API / Google Books API / 国立国会図書館 から書籍情報を取得する
 */

export async function fetchBookInfo(isbn) {
  // ISBN のハイフン除去・正規化
  const cleanIsbn = isbn.replace(/[-\s]/g, '');

  // 1. openBD を最初に試す（日本の書籍に強い）
  try {
    const result = await fetchFromOpenBD(cleanIsbn);
    if (result) {
      // openBDでカバー画像がなければNDLサムネイルを試す
      if (!result.coverUrl) {
        result.coverUrl = await fetchNdlThumbnail(cleanIsbn);
      }
      return result;
    }
  } catch (e) {
    console.warn('openBD fetch failed:', e);
  }

  // 2. Google Books にフォールバック
  try {
    const result = await fetchFromGoogleBooks(cleanIsbn);
    if (result) {
      // Google BooksでもカバーがなければNDLを試す
      if (!result.coverUrl) {
        result.coverUrl = await fetchNdlThumbnail(cleanIsbn);
      }
      return result;
    }
  } catch (e) {
    console.warn('Google Books fetch failed:', e);
  }

  return null;
}

async function fetchFromOpenBD(isbn) {
  const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data || !data[0]) return null;

  const summary = data[0].summary;
  if (!summary) return null;

  return {
    isbn,
    title: summary.title || '',
    author: summary.author || '',
    publisher: summary.publisher || '',
    coverUrl: summary.cover || '',
    source: 'openbd',
  };
}

async function fetchFromGoogleBooks(isbn) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`
  );
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.items || data.items.length === 0) return null;

  const info = data.items[0].volumeInfo;

  return {
    isbn,
    title: info.title || '',
    author: (info.authors || []).join(', '),
    publisher: info.publisher || '',
    coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
    source: 'googlebooks',
  };
}

/**
 * 国立国会図書館サムネイルAPI
 * URLにISBNを含めるだけで書影画像が取得できる（存在すれば200、なければ404）
 */
async function fetchNdlThumbnail(isbn) {
  const url = `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) return url;
  } catch {
    // NDL unreachable
  }
  return '';
}
