import type { User } from '../models/User.js';
import type { Book } from '../models/Book.js';

export const getMe = (token: string) => {
  return fetch('/api/users/me', {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });
};

export const createUser = (userData: User) => {
  return fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};

export const loginUser = (userData: User) => {
  return fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};

export const saveBook = (bookData: Book, token: string) => {
  return fetch('/api/users', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookData),
  });
};

export const deleteBook = (bookId: string, token: string) => {
  return fetch(`/api/users/books/${bookId}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

type GoogleVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };
};

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_sentence?: string | string[];
};

export type BookSuggestion = {
  title: string;
  author: string;
  query: string;
};

const normalizeGoogleBooks = (items: GoogleVolume[] = []): Book[] =>
  items.map((book) => ({
    bookId: book.id,
    authors: book.volumeInfo?.authors || ['Unknown author'],
    title: book.volumeInfo?.title || 'Untitled',
    description: book.volumeInfo?.description || 'No description available.',
    image: book.volumeInfo?.imageLinks?.thumbnail || '',
  }));

const normalizeOpenLibrary = (docs: OpenLibraryDoc[] = []): Book[] =>
  docs.map((book, index) => ({
    bookId: `openlibrary:${book.key || `${book.title || 'untitled'}-${index}`}`,
    authors: book.author_name?.length ? book.author_name : ['Unknown author'],
    title: book.title || 'Untitled',
    description:
      (Array.isArray(book.first_sentence) ? book.first_sentence[0] : book.first_sentence) ||
      'No description available.',
    image: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : '',
  }));

export const searchBooks = async (query: string): Promise<Book[]> => {
  const encodedQuery = encodeURIComponent(query.trim());

  try {
    const googleResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=30`
    );

    if (googleResponse.ok) {
      const payload = await googleResponse.json();
      const books = normalizeGoogleBooks(payload.items ?? []);
      if (books.length > 0) return books;
    }
  } catch {
    // Fall through to Open Library below.
  }

  const openLibraryResponse = await fetch(
    `https://openlibrary.org/search.json?q=${encodedQuery}&limit=30&fields=key,title,author_name,cover_i,first_sentence`
  );

  if (!openLibraryResponse.ok) {
    throw new Error('Book search providers are unavailable.');
  }

  const payload = await openLibraryResponse.json();
  return normalizeOpenLibrary(payload.docs ?? []);
};

export const searchBookSuggestions = async (query: string): Promise<BookSuggestion[]> => {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) return [];

  const encodedQuery = encodeURIComponent(trimmedQuery);
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodedQuery}&limit=10&fields=title,author_name`
  );

  if (!response.ok) return [];

  const payload = await response.json();
  const docs: OpenLibraryDoc[] = payload.docs ?? [];
  const seen = new Set<string>();

  return docs.reduce<BookSuggestion[]>((suggestions, doc) => {
    const title = doc.title?.trim();
    if (!title) return suggestions;

    const author = doc.author_name?.[0]?.trim() || 'Unknown author';
    const key = `${title.toLowerCase()}|${author.toLowerCase()}`;
    if (seen.has(key)) return suggestions;

    seen.add(key);
    suggestions.push({
      title,
      author,
      query: author === 'Unknown author' ? title : `${title} ${author}`,
    });

    return suggestions.length < 7 ? suggestions : suggestions;
  }, []).slice(0, 7);
};
