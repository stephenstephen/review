import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Cookies from 'js-cookie';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Récupérer le token d'authentification depuis les cookies
  const token = Cookies.get('auth-token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            // Configuration pour la pagination des produits
            keyArgs: false,
            merge(existing = { items: [], meta: {} }, incoming) {
              return incoming;
            },
          },
          reviews: {
            // Configuration pour la pagination des reviews
            keyArgs: false,
            merge(existing = { items: [], meta: {} }, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});