import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <div className={cn("card bg-base-100 shadow-xl", className)}>
      {product.image && (
        <figure>
          <Image
            src={`/uploads/${product.image}`}
            alt={product.name}
            width={300}
            height={200}
            className="object-cover w-full h-48"
          />
        </figure>
      )}
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-sm line-clamp-2">{product.description}</p>
        <div className="flex items-center mt-2">
          <span className="text-lg font-bold">{product.price.toFixed(2)} €</span>
          {product.averageRating && (
            <div className="flex items-center ml-auto">
              <Star className="w-4 h-4 fill-current text-yellow-500" />
              <span className="ml-1 text-sm">{product.averageRating.toFixed(1)}</span>
              <span className="ml-1 text-xs text-gray-500">({product.reviewsCount})</span>
            </div>
          )}
        </div>
        <div className="card-actions justify-end mt-4">
          <Link href={`/products/${product.id}`} className="btn btn-primary btn-sm">
            Voir détails
          </Link>
        </div>
      </div>
    </div>
  );
}