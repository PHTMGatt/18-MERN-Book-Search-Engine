import { gql } from 'graphql-tag';


const typeDefs = gql`

    type Book {
        bookId: ID!
        authors: [String]!
        description: String!
        image: String
        link: String
        title: String!
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        bookCount: Int
        savedBooks: [Book]
    }

    type Auth {
        token: ID!
        user: User
    }

    input BookInput {
        bookId: ID!
        authors: [String]!
        description: String!
        image: String
        title: String!
    }

    type Query {
        getMe: User
    }


    type Mutation {
        addUser(username: String!, email: String!, password: String!): Auth
        login(email: String!, password: String!): Auth
        saveBook(bookData: BookInput!): User
        deleteBook(bookId: ID!): User
    }
`;

export default typeDefs;


