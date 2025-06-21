'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/services/auth-service';
import { Menu, X, User, LogOut, ShoppingBag, Star, Home, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuthStore();

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-base-100 shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="navbar min-h-16">
          {/* Logo */}
          <div className="navbar-start">
            <Link href="/" className="text-xl font-bold">
              ProductReviews
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-2">
              <li>
                <Link
                  href="/"
                  className={cn(
                    pathname === '/' ? 'bg-base-200' : ''
                  )}
                >
                  <Home size={18} />
                  Accueil
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    href="/admin/products"
                    className={cn(
                      pathname?.startsWith('/admin') ? 'bg-base-200' : ''
                    )}
                  >
                    <Settings size={18} />
                    Administration
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Actions - Desktop */}
          <div className="navbar-end">
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="dropdown dropdown-end">
                  <button
                    tabIndex={0}
                    className="btn btn-ghost gap-2"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <User size={18} />
                    {user?.username || 'Mon compte'}
                  </button>
                  {isDropdownOpen && (
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                      onBlur={() => setIsDropdownOpen(false)}
                    >
                      <li>
                        <Link href="/profile" onClick={() => setIsDropdownOpen(false)}>
                          <User size={16} />
                          Mon profil
                        </Link>
                      </li>
                      <li>
                        <Link href="/profile/reviews" onClick={() => setIsDropdownOpen(false)}>
                          <Star size={16} />
                          Mes avis
                        </Link>
                      </li>
                      <li>
                        <button onClick={handleLogout} className="text-error">
                          <LogOut size={16} />
                          Déconnexion
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="btn btn-ghost">
                    Connexion
                  </Link>
                  <Link href="/auth/register" className="btn btn-primary">
                    Inscription
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="btn btn-ghost lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            <ul className="menu menu-vertical w-full gap-1">
              <li>
                <Link
                  href="/"
                  className={cn(
                    pathname === '/' ? 'bg-base-200' : ''
                  )}
                >
                  <Home size={18} />
                  Accueil
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    href="/admin/products"
                    className={cn(
                      pathname?.startsWith('/admin') ? 'bg-base-200' : ''
                    )}
                  >
                    <Settings size={18} />
                    Administration
                  </Link>
                </li>
              )}
              {isAuthenticated ? (
                <>
                  <li className="menu-title pt-4">
                    <span>Mon compte</span>
                  </li>
                  <li>
                    <Link href="/profile">
                      <User size={18} />
                      Mon profil
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/reviews">
                      <Star size={18} />
                      Mes avis
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="text-error">
                      <LogOut size={18} />
                      Déconnexion
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="menu-title pt-4">
                    <span>Compte</span>
                  </li>
                  <li>
                    <Link href="/auth/login">
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/register" className="bg-primary text-primary-content">
                      Inscription
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
