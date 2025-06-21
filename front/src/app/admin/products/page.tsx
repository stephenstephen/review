'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { PaginatedResponse, Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, truncateText } from '@/lib/utils';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts($page: Int, $limit: Int, $search: String) {
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

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Rediriger si l'utilisateur n'est pas connecté ou n'est pas admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Récupérer les produits
  const { data, isLoading, error } = useQuery<{ products: PaginatedResponse<Product> }>({
    queryKey: ['adminProducts', page, limit, search],
    queryFn: async () => {
      const { data } = await apolloClient.query({
        query: GET_ADMIN_PRODUCTS,
        variables: {
          page,
          limit,
          search: search || undefined,
        },
        fetchPolicy: 'network-only', // Important pour toujours avoir les données à jour
      });
      return data;
    },
    enabled: isAuthenticated && isAdmin,
  });

  // Mutation pour supprimer un produit
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_PRODUCT,
        variables: { id },
      });
      return data;
    },
    onSuccess: () => {
      // Invalider le cache pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setDeleteError(null);
    },
    onError: (error) => {
      console.error('Delete product error:', error);
      setDeleteError('Une erreur est survenue lors de la suppression du produit');
    },
    onSettled: () => {
      setIsDeleting(null);
    },
  });

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setIsDeleting(id);
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Retour à la première page lors d'une recherche
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestion des produits</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          <Plus size={16} />
          Nouveau produit
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="input input-bordered w-full pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button type="submit" className="btn btn-primary">
            Rechercher
          </button>
        </form>
      </div>

      {deleteError && (
        <div className="alert alert-error mb-6">
          <span>{deleteError}</span>
        </div>
      )}

      {/* État de chargement */}
      {isLoading && (
        <div className="flex justify-center my-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>Une erreur est survenue lors du chargement des produits.</span>
        </div>
      )}

      {/* Tableau des produits */}
      {data?.products.items.length === 0 ? (
        <div className="alert">
          <span>Aucun produit trouvé{search ? ` pour "${search}"` : ''}.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Nom</th>
                <th>Prix</th>
                <th>Note</th>
                <th>Avis</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.products.items.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>
                    {product.image ? (
                      <div className="avatar">
                        <div className="w-12 h-12 rounded">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="font-medium">{truncateText(product.name, 30)}</div>
                    <div className="text-sm opacity-50">{truncateText(product.description, 50)}</div>
                  </td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.averageRating?.toFixed(1) || 'N/A'}</td>
                  <td>{product.reviewsCount || 0}</td>
                  <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="btn btn-sm btn-outline"
                      >
                        <Edit size={14} />
                      </Link>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={isDeleting === product.id}
                      >
                        {isDeleting === product.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {(data?.products?.meta?.totalPages && data.products.meta.totalPages > 1) && (
        <div className="flex justify-center mt-12">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
            >
              «
            </button>
            
            {Array.from({ length: data.products.meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
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
              onClick={() => handlePageChange(Math.min(data.products.meta.totalPages, page + 1))}
              disabled={page === data.products.meta.totalPages || isLoading}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
