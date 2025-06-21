'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice, truncateText } from '@/lib/utils';
import { StarRating } from '@/components/reviews/star-rating';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, description, price, image, averageRating, reviewsCount } = product;
  
  return (
    <Link href={`/products/${id}`} className="block">
      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300">
        <figure className="relative h-48 w-full bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-gray-200">
              <span className="text-gray-400">Pas d'image</span>
            </div>
          )}
        </figure>
        
        <div className="card-body">
          <h2 className="card-title">{name}</h2>
          <p className="text-sm text-gray-600 mb-2">
            {truncateText(description, 100)}
          </p>
          
          <div className="flex items-center gap-2 mb-2">
            {averageRating ? (
              <>
                <StarRating rating={averageRating} size={16} />
                <span className="text-sm text-gray-600">
                  ({averageRating.toFixed(1)}) {reviewsCount} avis
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Aucun avis</span>
            )}
          </div>
          
          <div className="card-actions justify-between items-center">
            <span className="text-lg font-bold">{formatPrice(price)}</span>
            <button className="btn btn-primary btn-sm">Voir détails</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
