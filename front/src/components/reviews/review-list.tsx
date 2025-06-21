'use client';

import { useQuery } from '@tanstack/react-query';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { Review } from '@/types';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';

const GET_REVIEWS = gql`
  query GetReviews($filter: FilterReviewDto!) {
    reviews(filter: $filter) {
      items {
        id
        rating
        comment
        createdAt
        user {
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

interface PaginatedReviews {
  items: Review[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

interface ReviewListProps {
  productId: number;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  onFilterChange: (filter: any) => void;
}

export function ReviewList({
  productId,
  page,
  limit,
  sortBy,
  sortOrder,
  onFilterChange,
}: ReviewListProps) {
  const [searchText, setSearchText] = useState('');

  const { data, isLoading, error } = useQuery<{ reviews: PaginatedReviews }>({
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
  });

  const handlePageChange = (newPage: number) => {
    onFilterChange({ ...{ page, limit, sortBy, sortOrder }, page: newPage });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = event.target.value.split('-');
    onFilterChange({
      ...{ page, limit, sortBy, sortOrder },
      sortBy: newSortBy,
      sortOrder: newSortOrder,
      page: 1, // Revenir à la première page lors d'un changement de tri
    });
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onFilterChange({
      ...{ page, limit, sortBy, sortOrder },
      page: 1, // Revenir à la première page lors d'une recherche
    });
  };

  if (isLoading) return <div className="loading loading-spinner mx-auto my-4"></div>;
  if (error) return <div className="alert alert-error">Une erreur est survenue lors du chargement des avis</div>;
  if (!data?.reviews.items.length)
    return <div className="alert alert-info">Aucun avis pour ce produit pour le moment</div>;

  const { items: reviews, meta } = data.reviews;

  return (
    <div>
      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Rechercher dans les avis..."
            className="input input-bordered w-full max-w-xs"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Rechercher
          </button>
        </form>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm whitespace-nowrap">
            Trier par:
          </label>
          <select
            id="sort"
            className="select select-bordered"
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
          >
            <option value="createdAt-DESC">Plus récents</option>
            <option value="createdAt-ASC">Plus anciens</option>
            <option value="rating-DESC">Meilleure note</option>
            <option value="rating-ASC">Note la plus basse</option>
          </select>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-base-100 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= review.rating
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {review.user?.username || 'Utilisateur'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
            <p className="mt-3">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(Math.max(1, meta.currentPage - 1))}
              disabled={meta.currentPage === 1}
            >
              «
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`join-item btn ${pageNum === meta.currentPage ? 'btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="join-item btn"
              onClick={() => handlePageChange(Math.min(meta.totalPages, meta.currentPage + 1))}
              disabled={meta.currentPage === meta.totalPages}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
