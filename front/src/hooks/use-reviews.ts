import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { PaginatedResponse, Review, ReviewFilters } from '@/types';

const GET_REVIEWS = gql`
  query GetReviews($filter: FilterReviewDto!) {
    reviews(filter: $filter) {
      items {
        id
        rating
        comment
        createdAt
        updatedAt
        user {
          id
          username
        }
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

const CREATE_REVIEW = gql`
  mutation CreateReview($createReviewInput: CreateReviewInput!) {
    createReview(createReviewInput: $createReviewInput) {
      id
      rating
      comment
      createdAt
      productId
      user {
        id
        username
      }
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($id: Int!) {
    removeReview(id: $id) {
      id
    }
  }
`;

export function useReviews(filters: ReviewFilters) {
  const { productId, page = 1, limit = 5, sortBy = 'createdAt', sortOrder = 'DESC', searchText } = filters;

  return useQuery<{ reviews: PaginatedResponse<Review> }>({
    queryKey: ['reviews', productId, page, limit, sortBy, sortOrder, searchText],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GET_REVIEWS,
        variables: {
          filter: {
            productId,
            page,
            limit,
            sortBy,
            sortOrder,
            searchText: searchText || undefined,
          },
        },
      });
      return data;
    },
    enabled: !!productId,
  });
}

interface CreateReviewInput {
  productId: number;
  rating: number;
  comment: string;
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      const { data: responseData } = await apolloClient.mutate({
        mutation: CREATE_REVIEW,
        variables: {
          createReviewInput: data,
        },
      });
      return responseData.createReview;
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: number) => {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_REVIEW,
        variables: { id: reviewId },
      });
      return data.removeReview;
    },
    onSuccess: (_, reviewId) => {
      // Invalider les requêtes de reviews
      queryClient.invalidateQueries({ 
        predicate: query => 
          Array.isArray(query.queryKey) && 
          query.queryKey[0] === 'reviews'
      });
      
      // Invalider les requêtes de produits
      queryClient.invalidateQueries({ 
        queryKey: ['products'] 
      });
    },
  });
}
