import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import { DELETE_BOOK } from '../utils/mutations';
import { GET_ME } from '../utils/queries';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { Book } from '../models/Book';

const SavedBooks = () => {
  const { loading, data, error } = useQuery(GET_ME, {
    skip: !Auth.loggedIn(),
  });
  const [deleteBook] = useMutation(DELETE_BOOK, {
    refetchQueries: [{ query: GET_ME }],
  });

  const user = data?.getMe;

  const handleDeleteBook = async (bookId: string) => {
    if (!Auth.loggedIn()) return;

    try {
      await deleteBook({ variables: { bookId } });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!Auth.loggedIn()) {
    return (
      <Container className='results-section'>
        <div className='status-message'>Log in to view and manage your saved books.</div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className='results-section'>
        <div className='status-message'>Loading your saved books…</div>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container className='results-section'>
        <div className='status-message'>Your saved books could not be loaded right now.</div>
      </Container>
    );
  }

  const savedBooks: Book[] = user.savedBooks ?? [];

  return (
    <>
      <section className='book-hero book-hero--compact'>
        <Container>
          <span className='eyebrow'>Personal library</span>
          <h1>{user.username ? `${user.username}'s saved books` : 'Saved books'}</h1>
          <p>Keep the books you want to revisit in one clean shelf.</p>
        </Container>
      </section>

      <Container className='results-section'>
        <div className='section-heading'>
          <div>
            <span className='eyebrow'>Your shelf</span>
            <h2>
              {savedBooks.length
                ? `${savedBooks.length} saved ${savedBooks.length === 1 ? 'book' : 'books'}`
                : 'No saved books yet'}
            </h2>
          </div>
        </div>

        {savedBooks.length === 0 ? (
          <div className='status-message'>Search for a book and save it to start building your shelf.</div>
        ) : (
          <Row className='g-4'>
            {savedBooks.map((book) => (
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
                    <Button
                      className='mt-auto remove-button'
                      onClick={() => void handleDeleteBook(book.bookId)}
                    >
                      Remove from My Books
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default SavedBooks;
