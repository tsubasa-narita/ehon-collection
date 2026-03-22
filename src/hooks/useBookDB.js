import { openDB } from 'idb';

const DB_NAME = 'ehon-collection';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id', autoIncrement: true });
        bookStore.createIndex('isbn', 'isbn', { unique: false });
        bookStore.createIndex('status', 'status');
        bookStore.createIndex('favorite', 'favorite');
        bookStore.createIndex('createdAt', 'createdAt');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
}

export function useBookDB() {
  const addBook = async (bookData) => {
    const db = await getDB();
    const book = {
      ...bookData,
      status: bookData.status || 'unread',
      readCount: 0,
      readDates: [],
      favorite: false,
      createdAt: new Date().toISOString(),
    };
    const id = await db.add('books', book);
    return { ...book, id };
  };

  const updateBook = async (book) => {
    const db = await getDB();
    await db.put('books', book);
    return book;
  };

  const deleteBook = async (id) => {
    const db = await getDB();
    await db.delete('books', id);
  };

  const getBook = async (id) => {
    const db = await getDB();
    return db.get('books', id);
  };

  const getAllBooks = async () => {
    const db = await getDB();
    const books = await db.getAll('books');
    return books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getBookByIsbn = async (isbn) => {
    const db = await getDB();
    const index = db.transaction('books').store.index('isbn');
    return index.get(isbn);
  };

  const markAsRead = async (id) => {
    const db = await getDB();
    const book = await db.get('books', id);
    if (!book) return null;
    book.readCount = (book.readCount || 0) + 1;
    book.readDates = [...(book.readDates || []), new Date().toISOString()];
    book.status = 'read';
    await db.put('books', book);
    return book;
  };

  const toggleFavorite = async (id) => {
    const db = await getDB();
    const book = await db.get('books', id);
    if (!book) return null;
    book.favorite = !book.favorite;
    await db.put('books', book);
    return book;
  };

  const getTotalReadCount = async () => {
    const books = await getAllBooks();
    return books.reduce((sum, b) => sum + (b.readCount || 0), 0);
  };

  const getSetting = async (key) => {
    const db = await getDB();
    const row = await db.get('settings', key);
    return row?.value;
  };

  const setSetting = async (key, value) => {
    const db = await getDB();
    await db.put('settings', { key, value });
  };

  /**
   * 読書日付ごとのデータ集約: Map<'YYYY-MM-DD', Array<{id, title, coverUrl}>>
   */
  const getReadingDataByDate = async () => {
    const books = await getAllBooks();
    const dateMap = new Map();
    for (const book of books) {
      for (const dateStr of book.readDates || []) {
        const dateKey = dateStr.slice(0, 10);
        if (!dateMap.has(dateKey)) dateMap.set(dateKey, []);
        dateMap.get(dateKey).push({
          id: book.id,
          title: book.title,
          coverUrl: book.coverUrl,
        });
      }
    }
    return dateMap;
  };

  /**
   * 全データエクスポート
   */
  const exportAllData = async () => {
    const books = await getAllBooks();
    const db = await getDB();
    const allSettings = await db.getAll('settings');
    const settings = {};
    for (const s of allSettings) {
      settings[s.key] = s.value;
    }
    return { books, settings };
  };

  /**
   * データインポート
   * @param {object} data - { books: [], settings: {} }
   * @param {'merge'|'replace'} mode
   * @returns {number} インポートされた件数
   */
  const importData = async (data, mode) => {
    const db = await getDB();
    let importedCount = 0;

    const normalizeBook = (bookData) => ({
      ...bookData,
      status: bookData.status || 'unread',
      readCount: bookData.readCount || 0,
      readDates: bookData.readDates || [],
      favorite: bookData.favorite || false,
      createdAt: bookData.createdAt || new Date().toISOString(),
    });

    if (mode === 'replace') {
      // 単一トランザクションで原子的にclear→insert
      const tx = db.transaction('books', 'readwrite');
      await tx.store.clear();
      for (const book of data.books) {
        const { id, ...bookData } = book;
        await tx.store.add(normalizeBook(bookData));
        importedCount++;
      }
      await tx.done;
    } else {
      // merge: ISBNまたはtitle+authorで既存を照合
      const allExisting = await getAllBooks();
      for (const book of data.books) {
        const { id, ...bookData } = book;
        // ISBNで照合、なければtitle+authorで照合
        let existing = null;
        if (bookData.isbn) {
          existing = allExisting.find((b) => b.isbn === bookData.isbn);
        }
        if (!existing && bookData.title) {
          existing = allExisting.find(
            (b) => b.title === bookData.title && b.author === bookData.author
          );
        }

        if (existing) {
          if ((bookData.readCount || 0) > (existing.readCount || 0)) {
            existing.readCount = bookData.readCount;
            existing.readDates = bookData.readDates || existing.readDates;
            existing.status = bookData.status || existing.status;
            await db.put('books', existing);
            importedCount++;
          }
        } else {
          await db.add('books', normalizeBook(bookData));
          importedCount++;
        }
      }
    }

    // 設定インポート（常にマージ上書き）
    if (data.settings && typeof data.settings === 'object') {
      for (const [key, value] of Object.entries(data.settings)) {
        await setSetting(key, value);
      }
    }

    return importedCount;
  };

  return {
    addBook,
    updateBook,
    deleteBook,
    getBook,
    getAllBooks,
    getBookByIsbn,
    markAsRead,
    toggleFavorite,
    getTotalReadCount,
    getSetting,
    setSetting,
    getReadingDataByDate,
    exportAllData,
    importData,
  };
}
