import { useQuery } from '@tanstack/react-query';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { PaginatedResponse, Product } from '@/types';

const GET_PRODUCTS = gql`
  query GetProducts($page: Int, $limit: Int, $search: String) {
    products(page: $page, limit: $limit, search: $search) {
      items {
        id
        name
        description
        price
        image
        averageRating
        reviewsCount
        createdAt
        updatedAt
      }
      meta {
        totalItems
        itemCount
        itemsPerPage
        totalPages
        currentPage
      }
    }
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($id: Int!) {
    product(id: $id) {
      id
      name
      description
      price
      image
      averageRating
      reviewsCount
      createdAt
      updatedAt
    }
  }
`;

interface ProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export function useProducts(params: ProductsParams = {}) {
  const { page = 1, limit = 10, search } = params;

  return useQuery<{ products: PaginatedResponse<Product> }>({
    queryKey: ['products', page, limit, search],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GET_PRODUCTS,
        variables: {
          page,
          limit,
          search: search || undefined,
        },
      });
      return data;
    },
  });
}

export function useProduct(id: number) {
  return useQuery<{ product: Product }>({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GET_PRODUCT,
        variables: { id },
      });
      return data;
    },
    enabled: !!id,
  });
}