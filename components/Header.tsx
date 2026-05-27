'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export default function Header() {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-glass border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/assets/logo.webp" 
              style={{height: '70px', width: '110px'}} 
              alt="The Garden Guru Logo" 
              className="hover:opacity-90 transition-opacity" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Shop
            </Link>
            <Link href="/promotions" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Promotions
            </Link>
            <Link href="https://www.gardenguru.co.zw/" target="_blank" className="text-gray-700 hover:text-primary font-medium transition-colors">
              About Us
            </Link>
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-all shadow-md hover:shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-2">
            <Link href="/" className="block py-2 text-gray-700 hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <Link href="/shop" className="block py-2 text-gray-700 hover:text-primary font-medium transition-colors">
              Shop
            </Link>
            <Link href="/promotions" className="block py-2 text-gray-700 hover:text-primary font-medium transition-colors">
              Promotions
            </Link>
            <Link href="https://www.gardenguru.co.zw/" target="_blank" className="block py-2 text-gray-700 hover:text-primary font-medium transition-colors">
              About Us
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
