import { ApolloClient, ApolloLink, InMemoryCache, Observable, createHttpLink } from "@apollo/client/core";
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

function isAuthError(e) {
  return (
    e?.extensions?.code === "UNAUTHORIZED" ||
    e?.message?.toLowerCase().includes("unauthorized") ||
    e?.message?.toLowerCase().includes("not authenticated")
  );
}

function redirectToLogin() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

const errorLink = new ApolloLink((operation, forward) =>
  new Observable((observer) => {
    forward(operation).subscribe({
      next: (result) => {
        if (result.errors?.some(isAuthError)) {
          redirectToLogin();
          return;
        }
        observer.next(result);
      },
      error: (err) => {
        if (err?.statusCode === 401 || isAuthError(err)) {
          redirectToLogin();
          return;
        }
        observer.error(err);
      },
      complete: () => observer.complete(),
    });
  })
);

export const apolloClient = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});