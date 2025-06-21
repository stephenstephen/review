'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const CREATE_REVIEW = gql`
  mutation CreateReview($createReviewInput: CreateReviewInput!) {
    createReview(createReviewInput: $createReviewInput) {
      id
      rating
      comment
      createdAt
      productId
    }
  }
`;

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, 'Le commentaire doit contenir au moins 3 caractères'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: number;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const { data: responseData } = await apolloClient.mutate({
        mutation: CREATE_REVIEW,
        variables: {
          createReviewInput: {
            productId,
            rating: data.rating,
            comment: data.comment,
          },
        },
      });
      return responseData.createReview;
    },
    onSuccess: () => {
      // Invalider les requêtes pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      
      // Réinitialiser le formulaire
      reset();
      setRating(0);
    },
  });

  const onSubmit = (data: ReviewFormValues) => {
    createReviewMutation.mutate(data);
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue('rating', value);
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">Laisser un avis</h3>
      
      {createReviewMutation.isSuccess && (
        <div className="alert alert-success mb-4">
          <span>Votre avis a été publié avec succès !</span>
        </div>
      )}
      
      {createReviewMutation.isError && (
        <div className="alert alert-error mb-4">
          <span>Une erreur est survenue lors de la publication de votre avis.</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Note</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={cn(
                    'w-8 h-8',
                    (hoveredRating ? hoveredRating >= value : rating >= value)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  )}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <span className="text-error text-sm">{errors.rating.message}</span>
          )}
        </div>
        
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Commentaire
          </label>
          <textarea
            id="comment"
            {...register('comment')}
            rows={4}
            className="textarea textarea-bordered w-full"
            placeholder="Partagez votre expérience avec ce produit..."
          />
          {errors.comment && (
            <span className="text-error text-sm">{errors.comment.message}</span>
          )}
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || createReviewMutation.isPending}
        >
          {isSubmitting || createReviewMutation.isPending
            ? 'Publication en cours...'
            : 'Publier mon avis'}
        </button>
      </form>
    </div>
  );
}
