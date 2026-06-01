'use client';

import Link from 'next/link';
import { Star, TrendingUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  rating?: number;
}

interface FeaturedProductsProps {
  products: Product[];
  title: string;
  subtitle: string;
}

export default function FeaturedSection({
  products,
  title,
  subtitle,
}: FeaturedProductsProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-[#00b050]" />
            <span className="text-sm font-semibold text-[#00b050]">{subtitle}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">Hand-picked selections curated just for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <Link key={product.id} href={`/[id]?id=${product.id}`}>
              <div className="group cursor-pointer">
                <div className="relative mb-4 h-64 bg-gray-100 rounded-2xl overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#00b050] text-white text-xs font-bold px-3 py-1 rounded-full">
                      NEW
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#00b050] transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-1 mt-1">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">R{product.price}</span>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({product.rating})</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
