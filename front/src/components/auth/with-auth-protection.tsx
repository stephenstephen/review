'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function withAuthProtection<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuthStore();
    
    // Récupérer l'URL de callback si elle existe
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    useEffect(() => {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      if (!isAuthenticated) {
        const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(
          typeof window !== 'undefined' ? window.location.pathname : callbackUrl
        )}`;
        router.push(loginUrl);
      }
    }, [isAuthenticated, router, callbackUrl]);

    // Ne rien afficher pendant la vérification
    if (!isAuthenticated) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }

    // Rendre le composant si l'utilisateur est authentifié
    return <Component {...props} />;
  };
}
