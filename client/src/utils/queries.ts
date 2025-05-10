import { gql } from '@apollo/client'


// Note removed user{} within the getMe query. This fixed the savedBooks page

export const GET_ME = gql`
    query getMe{
        getMe {  
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
`;