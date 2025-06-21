'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth-service';
import { User } from 'lucide-react';

const profileSchema = z.object({
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  email: z.string().email('Email invalide').min(1, 'Email requis'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      // Mettre à jour les valeurs du formulaire si l'utilisateur est chargé
      reset({
        username: user?.username || '',
        email: user?.email || '',
      });
    }
  }, [isAuthenticated, router, user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      setMessage(null);

      // Appel API pour mettre à jour le profil (à implémenter dans auth-service)
      const updatedUser = await authService.updateProfile({
        username: data.username,
        email: data.email,
      });

      // Mettre à jour le store avec les nouvelles informations
      updateUser(updatedUser);

      setMessage({
        type: 'success',
        text: 'Profil mis à jour avec succès',
      });
    } catch (err: any) {
      console.error('Update profile error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Ne rien afficher pendant la redirection
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-24">
              <User size={48} />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">Mon profil</h1>

        {message && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
            <span>{message.text}</span>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="form-control">
                <label className="label" htmlFor="username">
                  <span className="label-text">Nom d'utilisateur</span>
                </label>
                <input
                  id="username"
                  type="text"
                  {...register('username')}
                  className="input input-bordered w-full"
                  disabled={isLoading}
                />
                {errors.username && (
                  <span className="text-error text-sm mt-1">{errors.username.message}</span>
                )}
              </div>

              <div className="form-control">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="input input-bordered w-full"
                  disabled={isLoading}
                />
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
                      Mise à jour en cours...
                    </>
                  ) : (
                    'Mettre à jour le profil'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
