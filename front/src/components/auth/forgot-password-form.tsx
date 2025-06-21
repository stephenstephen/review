'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail } from 'lucide-react';
import { authService } from '@/services/auth-service';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide').min(1, 'Email requis'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Appel au service d'authentification pour demander la réinitialisation
      await authService.forgotPassword(data.email);
      
      // Afficher le message de succès
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue. Veuillez réessayer plus tard.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center">Email envoyé</h2>
          <div className="alert alert-success">
            <p>
              Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation de mot de passe.
              Veuillez vérifier votre boîte de réception et vos spams.
            </p>
          </div>
          <div className="card-actions mt-6">
            <Link href="/auth/login" className="btn btn-primary w-full">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-center">Mot de passe oublié</h2>
        <p className="text-center text-gray-500 mb-6">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text">Email</span>
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                {...register('email')}
                className="input input-bordered w-full pl-10"
                placeholder="votre@email.com"
                disabled={isLoading}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {errors.email && (
              <span className="text-error text-sm mt-1">{errors.email.message}</span>
            )}
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link href="/auth/login" className="link link-hover text-sm">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
