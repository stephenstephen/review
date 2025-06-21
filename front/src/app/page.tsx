'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/products/product-card';
import { Search } from 'lucide-react';

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const { data, isLoading, error } = useProducts({ page, limit, search });
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Retour à la première page lors d'une recherche
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Nos produits</h1>
      
      {/* Barre de recherche */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
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
      
      {/* État de chargement */}
      {isLoading && (
        <div className="flex justify-center my-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
      
      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-error max-w-md mx-auto">
          <span>Une erreur est survenue lors du chargement des produits.</span>
        </div>
      )}
      
      {/* Aucun résultat */}
      {data?.products?.items?.length === 0 && (
        <div className="alert alert-info max-w-md mx-auto">
          <span>Aucun produit trouvé{search ? ` pour "${search}"` : ''}.</span>
        </div>
      )}

      {/* Grille de produits */}
      {data?.products?.items && data.products.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.products.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}

      {/* Pagination */}
      {data?.products?.meta?.totalPages && data.products.meta.totalPages > 1 ? (
        <div className="flex justify-center mt-12">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              «
            </button>
            
            {Array.from({ length: data.products.meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`join-item btn ${pageNum === page ? 'btn-active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}