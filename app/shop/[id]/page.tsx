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
import { ChevronLeft, ChevronRight, Info, Sprout } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [showPlantingModal, setShowPlantingModal] = useState(false);

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

              {/* Learn More Link */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowPlantingModal(true)}
                  className="flex items-center justify-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors py-3 w-full"
                >
                  <Sprout size={20} />
                  How to Plant
                </button>
                <a
                  href={`https://www.gardenguru.co.zw/wiki/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors py-3"
                >
                  <Info size={20} />
                  Learn more about this product
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

      {/* How to Plant Modal */}
      {showPlantingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-comic text-gray-900 flex items-center gap-3">
                  <Sprout className="text-[#00b050]" size={32} />
                  How to Plant
                </h3>
                <button
                  onClick={() => setShowPlantingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#00b050]/10 to-[#00b050]/5 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#00b050]" />
                  Planting Guide for {product.name}
                </h4>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00b050] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <p>Choose a suitable location with adequate sunlight and well-draining soil.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00b050] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                    <p>Dig a hole twice as wide as the root ball and slightly deeper than the container.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00b050] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                    <p>Gently remove the plant from its container and loosen the roots if they're circling.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00b050] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                    <p>Place the plant in the hole, ensuring the top of the root ball is level with the soil surface.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-[#00b050] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">5</div>
                    <p>Fill the hole with soil, water thoroughly, and add mulch around the base to retain moisture.</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Pro Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Water regularly during the first few weeks after planting</li>
                      <li>Add organic compost to enrich the soil</li>
                      <li>Monitor for pests and diseases regularly</li>
                      <li>For specific care instructions, visit our wiki page</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowPlantingModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Close
                </button>
                <a
                  href={`https://www.gardenguru.co.zw/wiki/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary text-center"
                >
                  Visit Wiki for More Info
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
