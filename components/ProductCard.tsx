'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const images = [
    product.image_url || '/images/placeholder.jpg',
    ...(product.gallery_images || [])
  ];

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  return (
    <div className="product-card group">
      <Link href={`/${product.id}`}>
        <div 
          className="relative h-64 overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {product.badge && (
            <span className="badge">{product.badge}</span>
          )}
          <Image
            src={images[currentImageIndex]}
            alt={product.name}
            fill
            className="object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 bg-white text-primary px-6 py-2 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Quick Add
            </button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-1">
          {product.category_id ? 'Category' : 'Product'}
        </p>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link href={`/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="text-2xl font-bold text-primary mb-3">
          {formatPrice(product.price)}
        </p>
        <button
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
