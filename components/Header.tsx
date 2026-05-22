'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-glass border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/assets/logo.webp" style={{height: '70px', width: '110px'}} alt="The Garden Guru Logo" className="text-[#00b050]" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Shop
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Contact
            </Link>
          </nav>

          <Link href="/cart" className="relative">
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-all shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
