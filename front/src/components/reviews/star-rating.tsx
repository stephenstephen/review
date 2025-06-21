'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  size = 18,
  className = '',
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>, starRating: number) => {
    if (interactive && onRatingChange && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onRatingChange(starRating);
    }
  };

  return (
    <div className={`flex ${className}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={`${
            interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
          }`}
          onClick={interactive ? () => handleClick(star) : undefined}
          onKeyDown={interactive ? (e) => handleKeyDown(e, star) : undefined}
          tabIndex={interactive ? 0 : undefined}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `Rate ${star} stars` : undefined}
        >
          <Star
            size={size}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </span>
      ))}
    </div>
  );
}
