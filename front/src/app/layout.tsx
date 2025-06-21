import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProductReviews - Avis et évaluations de produits',
  description: 'Découvrez et partagez des avis sur vos produits préférés',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="light">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow">
              {children}
            </div>
            <footer className="footer footer-center p-4 bg-base-200 text-base-content">
              <div>
                <p> {new Date().getFullYear()} ProductReviews - Tous droits réservés</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
