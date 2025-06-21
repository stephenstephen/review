'use client';

import { ReactNode, useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';
import { queryClient } from '@/lib/react-query';
import { authService } from '@/services/auth-service';
import { useAuthStore } from '@/store/auth-store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        try {
          // Vérifier si le token est toujours valide
          await authService.getCurrentUser();
        } catch (error) {
          console.error('Session expirée ou invalide', error);
          authService.logout();
        }
      }
    };

    checkAuth();
    setMounted(true);
  }, [isAuthenticated]);

  // Hydratation côté client
  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        {children}
      </ApolloProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
