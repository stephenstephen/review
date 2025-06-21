'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth-service';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      
      // Redirection vers la page d'accueil après inscription réussie
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Créer un compte</h1>
      
      {error && (
        <div className="alert alert-error mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-control">
          <label className="label" htmlFor="username">
            <span className="label-text">Nom d'utilisateur</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="username"
              type="text"
              {...register('username')}
              className="input input-bordered w-full pl-10"
              placeholder="Votre nom d'utilisateur"
              disabled={isLoading}
            />
          </div>
          {errors.username && (
            <span className="text-error text-sm mt-1">{errors.username.message}</span>
          )}
        </div>
        
        <div className="form-control">
          <label className="label" htmlFor="email">
            <span className="label-text">Email</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input input-bordered w-full pl-10"
              placeholder="votre@email.com"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <span className="text-error text-sm mt-1">{errors.email.message}</span>
          )}
        </div>
        
        <div className="form-control">
          <label className="label" htmlFor="password">
            <span className="label-text">Mot de passe</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="password"
              type="password"
              {...register('password')}
              className="input input-bordered w-full pl-10"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <span className="text-error text-sm mt-1">{errors.password.message}</span>
          )}
        </div>
        
        <div className="form-control">
          <label className="label" htmlFor="confirmPassword">
            <span className="label-text">Confirmer le mot de passe</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="input input-bordered w-full pl-10"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-error text-sm mt-1">{errors.confirmPassword.message}</span>
          )}
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Inscription en cours...
            </>
          ) : (
            'S\'inscrire'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p>
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
