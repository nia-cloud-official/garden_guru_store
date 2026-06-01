'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, X, Sliders } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface StoreFiltersProps {
  products: Product[];
  categories: Array<{ name: string; slug: string }>;
  onFiltersChange: (filtered: Product[]) => void;
  activeCategory: string;
}

export default function StoreFilters({
  products,
  categories,
  onFiltersChange,
  activeCategory,
}: StoreFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate min/max prices
  const prices = products.map(p => p.price).filter(p => p);
  const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
  const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000;

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        break;
    }

    onFiltersChange(filtered);
  }, [searchTerm, priceRange, sortBy, products]);

  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([minPrice, maxPrice]);
    setSortBy('newest');
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00b050] focus:border-transparent transition-all"
        />
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Sliders size={18} />
          <span>Filters</span>
          <ChevronDown size={16} className={showFilters ? 'rotate-180' : ''} />
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00b050] focus:border-transparent transition-all"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>

        {(searchTerm || sortBy !== 'newest' || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-[#00b050] hover:bg-emerald-50 rounded-xl transition-colors"
          >
            <X size={16} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-glass rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">
                    Min: R{priceRange[0].toFixed(0)}
                  </label>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = Number(e.target.value);
                      if (newMin <= priceRange[1]) {
                        setPriceRange([newMin, priceRange[1]]);
                      }
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-2">
                    Max: R{priceRange[1].toFixed(0)}
                  </label>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = Number(e.target.value);
                      if (newMax >= priceRange[0]) {
                        setPriceRange([priceRange[0], newMax]);
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Active Filters</h3>
              <div className="space-y-2">
                {searchTerm && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                    Search: {searchTerm}
                  </div>
                )}
                {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm block">
                    R{priceRange[0].toFixed(0)} - R{priceRange[1].toFixed(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
