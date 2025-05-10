import { gql } from '@apollo/client'


export const GET_ME = gql`
    query getMe {
        getMe {
            user {
                _id
                username
                email
                bookCount
                savedBooks {
                    bookId
                    authors
                    description
                    image
                    link
                    title
                }
            }
        }
    }
`;