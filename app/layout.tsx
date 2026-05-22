import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <Head>
      <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/comic-sans-ms"
        />
        </Head>
      <body className={inter.className}>
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
