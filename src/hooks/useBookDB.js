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
  };
}
