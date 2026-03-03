import { gql } from "@apollo/client/core";

export const AVG_RESPONSE_TIME = gql`
  query GetAverageAgentResponseTime {
    averageAgentResponseTime
  }
`; 