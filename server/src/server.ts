import express from 'express';
import { ApolloServer } from '@apollo/server';
import path from 'node:path';
import db from './config/connection.js';
//import routes from './routes/index.js';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './services/auth.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();
const PORT = process.env.PORT || 3001;

const startApolloServer = async () => {
  await server.start();
  await db;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
  }
  
  //app.use(routes);
  app.use('/graphql', expressMiddleware(server, {
    context: authenticateToken as any
  }));
  
  app.listen(PORT, () => console.log(`🌍 Now listening on http://localhost:${PORT}/graphql`));
}

startApolloServer();

