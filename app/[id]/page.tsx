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
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

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
        router.push('/');
        return;
      }

      setProduct(data);
      
      // Build images array from main image and gallery
      const productImages: string[] = [];
      if (data.image_url) {
        productImages.push(data.image_url);
      }
      if (data.gallery_images && Array.isArray(data.gallery_images)) {
        productImages.push(...data.gallery_images);
      }
      setImages(productImages.length > 0 ? productImages : ['/images/placeholder.jpg']);
      
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

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
      {/* Breadcrumb */}
      <section className="bg-gray-50 py-4 mt-20">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-primary">
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link href="/shop" className="text-gray-600 hover:text-primary">
              Shop
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>
                {product.short_description && (
                  <p className="text-lg text-gray-600">
                    {product.short_description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock_quantity > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">
                      In Stock ({product.stock_quantity} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors font-semibold"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center py-3 outline-none font-semibold"
                      min="1"
                      max={product.stock_quantity}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors font-semibold"
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Max: {product.stock_quantity}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg font-semibold text-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <Link
                  href="/cart"
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-900 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  View Cart
                </Link>
              </div>

              {/* Learn More and Wiki Links */}
              <div className="bg-gradient-to-br from-[#00b050]/10 to-[#00b050]/5 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <Info size={22} className="text-primary" />
                  Plant Care Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`https://www.gardenguru.co.zw/wiki#how-to-plant`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors py-3 px-4 bg-white rounded-lg shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    How to Plant
                  </a>

                  <a
                    href={`https://www.gardenguru.co.zw/wiki#watering-guide`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors py-3 px-4 bg-white rounded-lg shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Watering Guide
                  </a>

                  <a
                    href={`https://www.gardenguru.co.zw/wiki#fertilizing`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors py-3 px-4 bg-white rounded-lg shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Fertilizing Tips
                  </a>

                  <a
                    href={`https://www.gardenguru.co.zw/wiki#pest-control`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors py-3 px-4 bg-white rounded-lg shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Pest Control
                  </a>
                </div>

                <a
                  href={`https://www.gardenguru.co.zw/wiki/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors py-3 px-4 bg-white rounded-lg shadow-md hover:shadow-lg border-2 border-primary/20 hover:border-primary/40"
                >
                  <Info size={20} />
                  View Complete Plant Wiki
                </a>
              </div>

              {/* Product Meta */}
              <div className="border-t border-gray-200 pt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium text-gray-900">{product.sku}</span>
                </div>
                {product.barcode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barcode:</span>
                    <span className="font-medium text-gray-900">{product.barcode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
