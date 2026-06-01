'use client';

import { useState, useMemo } from 'react';
import StoreFilters from './StoreFilters';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

interface ProductsGridProps {
  allProducts: Product[];
  categories: Array<{ name: string; slug: string }>;
  activeCategory: string;
}

export default function ProductsGrid({
  allProducts,
  categories,
  activeCategory,
}: ProductsGridProps) {
  const [filteredProducts, setFilteredProducts] = useState(allProducts);

  return (
    <div className="flex-1">
      <StoreFilters
        products={allProducts}
        categories={categories}
        onFiltersChange={setFilteredProducts}
        activeCategory={activeCategory}
      />

      <div className="mb-8 p-4 bg-white/80 backdrop-blur-glass rounded-2xl border border-gray-200">
        <p className="text-gray-600">
          Showing <strong className="text-gray-900">{filteredProducts.length}</strong> product
          {filteredProducts.length !== 1 ? 's' : ''}
          {activeCategory && (
            <span>
              {' '}in <strong className="text-[#00b050]">{activeCategory}</strong>
            </span>
          )}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white/80 backdrop-blur-glass rounded-3xl border border-gray-200">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h4 className="text-2xl font-comic text-gray-900 mb-4">No products found</h4>
          <Link href="/" className="btn-primary inline-block">
            View All
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
