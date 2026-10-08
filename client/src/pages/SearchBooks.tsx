import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { searchBooks } from '../utils/API';
import { getSavedBookIds, saveBookIds } from '../utils/localStorage';
import type { Book } from '../models/Book';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState<string[]>(getSavedBookIds());
  const [statusMessage, setStatusMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [saveBook] = useMutation(SAVE_BOOK);

  useEffect(() => {
    saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchInput.trim();
    if (!query) {
      setStatusMessage('Enter a title, author, or keyword to search.');
      return;
    }

    setIsSearching(true);
    setStatusMessage('');

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
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search by title, author, or keyword'
                  aria-label='Search books'
                />
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
