import { useEffect, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { searchBooks, searchBookSuggestions } from '../utils/API';
import type { BookSuggestion } from '../utils/API';
import { getSavedBookIds, saveBookIds } from '../utils/localStorage';
import type { Book } from '../models/Book';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState<string[]>(getSavedBookIds());
  const [statusMessage, setStatusMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const [saveBook] = useMutation(SAVE_BOOK);

  useEffect(() => {
    saveBookIds(savedBookIds);
  }, [savedBookIds]);

  useEffect(() => {
    const query = searchInput.trim();
    setActiveSuggestion(-1);

    if (query.length < 2 || isSearching) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const nextSuggestions = await searchBookSuggestions(query);
        if (!cancelled) setSuggestions(nextSuggestions);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, 275);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchInput, isSearching]);

  const performSearch = async (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) {
      setStatusMessage('Enter a title, author, or keyword to search.');
      return;
    }

    setIsSearching(true);
    setStatusMessage('');
    setSuggestions([]);
    setActiveSuggestion(-1);

    try {
      const bookData = await searchBooks(query);
      setSearchedBooks(bookData);
      setSearchInput('');

      if (bookData.length === 0) {
        setStatusMessage(`No books found for “${query}”.`);
      }
    } catch (err) {
      console.error(err);
      setSearchedBooks([]);
      setStatusMessage('Unable to search books right now. Try again in a moment.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await performSearch(searchInput);
  };

  const handleSuggestionClick = async (suggestion: BookSuggestion) => {
    setSearchInput(suggestion.title);
    await performSearch(suggestion.query);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestion((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );
    } else if (event.key === 'Enter' && activeSuggestion >= 0) {
      event.preventDefault();
      void handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (event.key === 'Escape') {
      setSuggestions([]);
      setActiveSuggestion(-1);
    }
  };

  const handleSaveBook = async (bookId: string) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!bookToSave || !Auth.loggedIn()) return;

    try {
      await saveBook({ variables: { bookData: { ...bookToSave } } });
      setSavedBookIds((current) =>
        current.includes(bookToSave.bookId) ? current : [...current, bookToSave.bookId]
      );
    } catch (err) {
      console.error(err);
      setStatusMessage('That book could not be saved. Please try again.');
    }
  };

  return (
    <>
      <section className='book-hero'>
        <Container>
          <span className='eyebrow'>Book discovery</span>
          <h1>Find your next read.</h1>
          <p>Search millions of books, then save favorites to your personal shelf.</p>

          <Form onSubmit={handleFormSubmit} className='book-search-form'>
            <Row className='g-3'>
              <Col xs={12} md={9}>
                <div className='search-autocomplete'>
                  <Form.Control
                    name='searchInput'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => setActiveSuggestion(-1)}
                    type='text'
                    size='lg'
                    placeholder='Search by title, author, or keyword'
                    aria-label='Search books'
                    autoComplete='off'
                  />

                  {suggestions.length > 0 ? (
                    <div className='search-suggestions' role='listbox' aria-label='Book suggestions'>
                      {suggestions.map((suggestion, index) => (
                        <button
                          type='button'
                          key={`${suggestion.title}-${suggestion.author}-${index}`}
                          className={`search-suggestion${index === activeSuggestion ? ' is-active' : ''}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => void handleSuggestionClick(suggestion)}
                        >
                          <span>{suggestion.title}</span>
                          <small>{suggestion.author}</small>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Col>
              <Col xs={12} md={3}>
                <Button type='submit' size='lg' className='w-100 primary-action' disabled={isSearching}>
                  {isSearching ? 'Searching…' : 'Search Books'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </section>

      <Container className='results-section'>
        <div className='section-heading'>
          <div>
            <span className='eyebrow'>Results</span>
            <h2>
              {searchedBooks.length
                ? `${searchedBooks.length} ${searchedBooks.length === 1 ? 'book' : 'books'} found`
                : 'Search to explore books'}
            </h2>
          </div>
          {!Auth.loggedIn() && searchedBooks.length > 0 ? (
            <span className='helper-text'>Log in to save books to your shelf.</span>
          ) : null}
        </div>

        {statusMessage ? <div className='status-message'>{statusMessage}</div> : null}

        <Row className='g-4'>
          {searchedBooks.map((book) => {
            const isSaved = savedBookIds.includes(book.bookId);

            return (
              <Col sm={12} md={6} lg={4} key={book.bookId}>
                <Card className='book-card h-100'>
                  <div className='book-cover-wrap'>
                    {book.image ? (
                      <Card.Img src={book.image} alt={`Cover for ${book.title}`} className='book-cover' />
                    ) : (
                      <div className='book-cover-placeholder'>No cover</div>
                    )}
                  </div>
                  <Card.Body className='d-flex flex-column'>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='book-authors'>{book.authors.join(', ')}</p>
                    <Card.Text className='book-description'>{book.description}</Card.Text>
                    {Auth.loggedIn() ? (
                      <Button
                        disabled={isSaved}
                        className='mt-auto save-button'
                        onClick={() => void handleSaveBook(book.bookId)}
                      >
                        {isSaved ? 'Saved' : 'Save to My Books'}
                      </Button>
                    ) : null}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
