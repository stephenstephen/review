import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const authRoutes = ['/profile', '/profile/reviews'];

// Routes qui nécessitent un rôle administrateur
const adminRoutes = ['/admin', '/admin/products', '/admin/reviews', '/admin/users'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = !!token;

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  // et tente d'accéder à une route protégée
  if (!isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Pour les routes admin, nous ne pouvons pas vérifier le rôle ici car le middleware
  // n'a pas accès au store Zustand ou aux données décodées du JWT.
  // La vérification du rôle admin devra être faite côté client dans les composants.

  return NextResponse.next();
}

// Configurer sur quelles routes le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};