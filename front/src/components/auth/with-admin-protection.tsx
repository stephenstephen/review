'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function withAdminProtection<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { isAuthenticated, isAdmin } = useAuthStore();

    useEffect(() => {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!isAuthenticated) {
        router.push('/auth/login');
      } 
      // Si l'utilisateur est connecté mais n'est pas admin, rediriger vers la page d'accueil
      else if (!isAdmin) {
        router.push('/');
      }
    }, [isAuthenticated, isAdmin, router]);

    // Ne rien afficher pendant la vérification
    if (!isAuthenticated || !isAdmin) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }

    // Rendre le composant si l'utilisateur est admin
    return <Component {...props} />;
  };
}
