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
      id title description status createdAt attachmentUrls
      customer { id name email }
      agent { id name email }
      comments {
        id body createdAt
        user { id name role }
      }
    }
  }
`;

export const CREATE_TICKET = gql`
  mutation CreateTicket($title: String!, $description: String!) {
    createTicket(
      input: {
        title: $title
        description: $description
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

export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus($ticketId: ID!, $status: String!) {
    updateTicketStatus(input: { ticketId: $ticketId, status: $status }) {
      ticket { id status }
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