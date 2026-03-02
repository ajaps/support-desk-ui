import { gql } from "@apollo/client/core";

export const GET_TICKETS = gql`
  query GetTickets($status: String, $first: Int, $after: String) {
    tickets(status: $status, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id title status createdAt
          customer { name email }
          agent { name }
        }
      }
    }
  }
`;

export const GET_TICKET = gql`
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id title description status createdAt fileUrl
      customer { id name email }
      agent { id name email }
      comments {
        id body createdAt
        author:user { id name role }
      }
    }
  }
`;

export const CREATE_TICKET = gql`
  mutation CreateTicket($title: String!, $description: String!, $fileSignedId: String) {
    createTicket(
      input: {
        title: $title
        description: $description
        fileSignedId: $fileSignedId
      }
    ) {
      ticket {
        id
        title
      }
      errors
    }
  }
`;

export const CLOSE_TICKET = gql`
  mutation closeTicket($ticketId: ID!) {
    closeTicket(input: { ticketId: $ticketId}) {
      ticket { id status closedAt }
      errors
    }
  }
`;

export const ASSIGN_TICKET = gql`
  mutation AssignTicket($ticketId: ID!) {
    assignTicket(input: { ticketId: $ticketId }) {
      ticket { id status agent { name } }
      errors
    }
  }
`;