'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast.error('Product not found');
        router.push('/shop');
        return;
      }

      setProduct(data);
      setLoading(false);
    }

    fetchProduct();
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-24 mt-0">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-comic text-gray-900 mb-4">
              {product.name}
            </h1>
            <nav className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-glass px-6 py-2 rounded-full mt-4 border border-gray-200">
              <Link href="/" className="text-gray-600 hover:text-primary text-sm">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/shop" className="text-gray-600 hover:text-primary text-sm">
                Shop
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-primary font-medium text-sm">{product.name}</span>
            </nav>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Product Image */}
            <div className="relative h-96 md:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <Image
                src={product.image_url || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div>
              <p className="text-primary font-semibold uppercase tracking-wide text-sm mb-3">
                Product
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h2>
              <h3 className="text-4xl font-bold text-primary mb-6">
                {formatPrice(product.price)}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-gray-700 font-medium">Quantity:</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center py-2 outline-none"
                    min="1"
                    max="99"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
                <Link href="/cart" className="btn-secondary text-center">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
