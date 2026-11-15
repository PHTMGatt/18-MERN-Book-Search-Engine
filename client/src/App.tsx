import './App.css';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/client/react';
import { Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';

const httpLink = new HttpLink({
  uri: '/graphql',
});

const authLink = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem('id_token');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <main className='app-shell'>
        <Outlet />
      </main>
    </ApolloProvider>
  );
}

export default App;
