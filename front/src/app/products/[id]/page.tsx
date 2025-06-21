'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/use-products';
import { ReviewForm } from '@/components/reviews/review-form';
import { ReviewList } from '@/components/reviews/review-list';
import { StarRating } from '@/components/reviews/star-rating';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { SortField, SortOrder } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string, 10);
  const { isAuthenticated } = useAuthStore();
  
  const [reviewFilters, setReviewFilters] = useState({
    page: 1,
    limit: 5,
    sortBy: SortField.CREATED_AT,
    sortOrder: SortOrder.DESC,
  });
  
  const { data, isLoading, error } = useProduct(productId);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="alert alert-error max-w-md mx-auto">
          <span>Une erreur est survenue lors du chargement du produit.</span>
        </div>
      </div>
    );
  }
  
  const { product } = data;
  
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Bouton retour */}
      <Link href="/" className="btn btn-ghost mb-6 gap-2">
        <ArrowLeft size={16} />
        Retour aux produits
      </Link>
      
      {/* Détails du produit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image du produit */}
        <div className="relative h-80 md:h-96 bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-gray-200">
              <span className="text-gray-400">Pas d'image</span>
            </div>
          )}
        </div>
        
        {/* Informations du produit */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            {product.averageRating ? (
              <>
                <StarRating rating={product.averageRating} />
                <span className="text-sm">
                  ({product.averageRating.toFixed(1)}) {product.reviewsCount} avis
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Aucun avis</span>
            )}
          </div>
          
          <div className="text-2xl font-bold mb-6">{formatPrice(product.price)}</div>
          
          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p>{product.description}</p>
          </div>
          
          <button className="btn btn-primary">Ajouter au panier</button>
        </div>
      </div>
      
      {/* Section des avis */}
      <div className="divider my-12">Avis clients</div>
      
      {/* Formulaire d'ajout d'avis (uniquement pour les utilisateurs connectés) */}
      {isAuthenticated ? (
        <ReviewForm productId={productId} />
      ) : (
        <div className="alert mb-8">
          <span>
            Vous devez être <Link href="/auth/login" className="link link-primary">connecté</Link> pour laisser un avis.
          </span>
        </div>
      )}
      
      {/* Liste des avis */}
      <ReviewList
        productId={productId}
        page={reviewFilters.page}
        limit={reviewFilters.limit}
        sortBy={reviewFilters.sortBy}
        sortOrder={reviewFilters.sortOrder}
        onFilterChange={(newFilters) => setReviewFilters({ ...reviewFilters, ...newFilters })}
      />
    </main>
  );
}