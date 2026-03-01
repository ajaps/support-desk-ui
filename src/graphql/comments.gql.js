import { gql } from "@apollo/client/core";

export const CREATE_COMMENT = gql`
  mutation CreateComment($ticketId: ID!, $body: String!) {
    createComment(input: { ticketId: $ticketId, body: $body }) {
      comment { id body createdAt user { name role } }
      errors
    }
  }
`;