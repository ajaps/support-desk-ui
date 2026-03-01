import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: (import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:3000/graphql'),
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("jwt");
  return {
    headers: { ...headers, Authorization: token ? `Bearer ${token}` : "" },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});