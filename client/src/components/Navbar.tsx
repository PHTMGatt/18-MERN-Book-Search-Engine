import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Modal, Nav, Navbar, Tab } from 'react-bootstrap';
import SignUpForm from './SignupForm';
import LoginForm from './LoginForm';
import Auth from '../utils/auth';

const AppNavbar = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Navbar expand='lg' className='app-navbar'>
        <Container>
          <Navbar.Brand as={Link} to='/' className='brand-link'>
            <span className='brand-mark'>B</span>
            <span>
              <strong>BookFinder</strong>
              <small>Search. Save. Read.</small>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls='navbar' />
          <Navbar.Collapse id='navbar'>
            <Nav className='ms-auto align-items-lg-center gap-lg-2'>
              <Nav.Link as={Link} to='/'>Search Books</Nav.Link>
              {Auth.loggedIn() ? (
                <>
                  <Nav.Link as={Link} to='/saved'>My Books</Nav.Link>
                  <button type='button' className='nav-action nav-action--ghost' onClick={Auth.logout}>
                    Logout
                  </button>
                </>
              ) : (
                <button type='button' className='nav-action' onClick={() => setShowModal(true)}>
                  Login / Sign Up
                </button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal
        size='lg'
        show={showModal}
        onHide={() => setShowModal(false)}
        aria-labelledby='signup-modal'
        centered
        contentClassName='auth-modal'
      >
        <Tab.Container defaultActiveKey='login'>
          <Modal.Header closeButton>
            <Modal.Title id='signup-modal'>
              <Nav variant='pills' className='auth-tabs'>
                <Nav.Item>
                  <Nav.Link eventKey='login'>Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='signup'>Sign Up</Nav.Link>
                </Nav.Item>
              </Nav>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tab.Content>
              <Tab.Pane eventKey='login'>
                <LoginForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
              <Tab.Pane eventKey='signup'>
                <SignUpForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
            </Tab.Content>
          </Modal.Body>
        </Tab.Container>
      </Modal>
    </>
  );
};

export default AppNavbar;
