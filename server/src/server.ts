import express from 'express';
import type { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import path from 'node:path';
import db from './config/connection.js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
//import routes from './routes/index.js';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './services/auth.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Todo: initialize ApolloServer and Express app—add urlencoded/json parsers, serve static assets in production, mount '/graphql' route with authenticateToken context, and start listening on PORT
// Note sets up express.urlencoded({ extended: true }) and express.json(), conditionally serves client/dist in production, uses expressMiddleware(server, { context: authenticateToken }), and logs the server URL on startup


const app = express();
const PORT = process.env.PORT || 3001;

const startApolloServer = async () => {
  await server.start();
  await db;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  
  // Note - WE remove the original RESTful API routes, and we update the HTTP METHOD and endpoint/address to use our NEW APOLLO graphql (setup) POST:METHOD and '/graphql' endpoint or address
  //app.use(routes);  // original RESTful API routes  --> fetch requests to '/api' endpoint
  app.use('/graphql', expressMiddleware(server, {
    context: authenticateToken as any
  }));
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }
  
  app.listen(PORT, () => console.log(`🌍 Now listening on http://localhost:${PORT}/graphql`));
}

startApolloServer();

