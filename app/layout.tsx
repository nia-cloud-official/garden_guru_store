import type { Metadata } from 'next';
import { Raleway, Comic_Neue } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const raleway = Raleway({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
});

const comicNeue = Comic_Neue({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comic',
});

export const metadata: Metadata = {
  title: 'The Garden Guru - Fresh Flowers & Plants',
  description: 'Hand-picked bouquets and garden plants, crafted with love. No account needed — just pick, pay, and collect.',
  icons: {
    icon: [
      { url: '/assets/favicon.png', type: 'image/png' },
      { url: '/assets/favicon.webp', type: 'image/webp' },
    ],
    shortcut: '/assets/favicon.png',
    apple: '/assets/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${raleway.variable} ${comicNeue.variable}`}>
      <body className={raleway.className}>
        <CartProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}
