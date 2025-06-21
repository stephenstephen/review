'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { PaginatedResponse, Review, SortField, SortOrder } from '@/types';
import { StarRating } from '@/components/reviews/star-rating';
import Link from 'next/link';
import { formatPrice, truncateText } from '@/lib/utils';
import { Trash2, Edit, ArrowLeft } from 'lucide-react';

const GET_USER_REVIEWS = gql`
  query GetUserReviews($page: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
    userReviews(page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
      items {
        id
        productId
        rating
        comment
        createdAt
        product {
          id
          name
          image
          price
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

const DELETE_REVIEW = gql`
  mutation DeleteReview($id: Int!) {
    deleteReview(id: $id) {
      id
    }
  }
`;

export default function UserReviewsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState<SortField>(SortField.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Récupérer les avis de l'utilisateur
  const { data, isLoading, error, refetch } = useQuery<{ userReviews: PaginatedResponse<Review> }>({
    queryKey: ['userReviews', page, limit, sortBy, sortOrder],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GET_USER_REVIEWS,
        variables: {
          page,
          limit,
          sortBy,
          sortOrder,
        },
        fetchPolicy: 'network-only', // Important pour toujours avoir les données à jour
      });
      return data;
    },
    enabled: isAuthenticated,
  });

  // Supprimer un avis
  const handleDeleteReview = async (reviewId: number) => {
    try {
      setIsDeleting(reviewId);
      setDeleteError(null);

      await apolloClient.mutate({
        mutation: DELETE_REVIEW,
        variables: { id: reviewId },
      });

      // Rafraîchir la liste des avis
      refetch();
    } catch (err: any) {
      console.error('Delete review error:', err);
      setDeleteError('Une erreur est survenue lors de la suppression de l\'avis');
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'date-desc') {
      setSortBy(SortField.CREATED_AT);
      setSortOrder(SortOrder.DESC);
    } else if (value === 'date-asc') {
      setSortBy(SortField.CREATED_AT);
      setSortOrder(SortOrder.ASC);
    } else if (value === 'rating-desc') {
      setSortBy(SortField.RATING);
      setSortOrder(SortOrder.DESC);
    } else if (value === 'rating-asc') {
      setSortBy(SortField.RATING);
      setSortOrder(SortOrder.ASC);
    }
  };

  if (!isAuthenticated) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/profile" className="btn btn-ghost mb-6 gap-2">
          <ArrowLeft size={16} />
          Retour au profil
        </Link>

        <h1 className="text-2xl font-bold mb-8">Mes avis</h1>

        {deleteError && (
          <div className="alert alert-error mb-6">
            <span>{deleteError}</span>
          </div>
        )}

        {/* Options de tri */}
        <div className="flex justify-end mb-6">
          <select
            className="select select-bordered"
            value={`${sortBy === SortField.CREATED_AT ? 'date' : 'rating'}-${sortOrder.toLowerCase()}`}
            onChange={handleSortChange}
            disabled={isLoading}
          >
            <option value="date-desc">Date (récent → ancien)</option>
            <option value="date-asc">Date (ancien → récent)</option>
            <option value="rating-desc">Note (haute → basse)</option>
            <option value="rating-asc">Note (basse → haute)</option>
          </select>
        </div>

        {/* État de chargement */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="alert alert-error">
            <span>Une erreur est survenue lors du chargement de vos avis.</span>
          </div>
        )}

        {/* Aucun avis */}
        {data?.userReviews?.items?.length === 0 && (
          <div className="alert">
            <span>Vous n'avez pas encore publié d'avis.</span>
          </div>
        )}

        {/* Liste des avis */}
        {data?.userReviews?.items && data.userReviews.items.length > 0 && (
          <div className="space-y-6">
            {data.userReviews.items.map((review) => (
              <div key={review.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Informations du produit */}
                    <div className="flex-1">
                      <Link
                        href={`/products/${review.productId}`}
                        className="text-lg font-semibold hover:text-primary"
                      >
                        {review.product?.name}
                      </Link>
                      <div className="flex items-center mt-2">
                        <StarRating rating={review.rating} />
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2">{review.comment}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/products/${review.productId}/reviews/edit/${review.id}`}
                        className="btn btn-sm btn-outline"
                      >
                        <Edit size={16} />
                        Modifier
                      </Link>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={isDeleting === review.id}
                      >
                        {isDeleting === review.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(data?.userReviews?.meta?.totalPages && data.userReviews.meta.totalPages > 1) && (
          <div className="flex justify-center mt-12">
            <div className="join">
              <button
                className="join-item btn"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1 || isLoading}
              >
                «
              </button>
              
              {Array.from({ length: data.userReviews.meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`join-item btn ${pageNum === page ? 'btn-active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isLoading}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                className="join-item btn"
                onClick={() => handlePageChange(Math.min(data.userReviews.meta.totalPages, page + 1))}
                disabled={page === data.userReviews.meta.totalPages || isLoading}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
