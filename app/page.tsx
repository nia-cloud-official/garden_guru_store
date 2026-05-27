import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import Image from 'next/image';
import promotionsData from '@/data/promotions.json';

async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('store_products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data || [];
}

async function getCategories() {
  const { data, error } = await supabase
    .from('store_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
    .limit(6);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();
  const activePromotions = promotionsData.promotions.filter(p => p.active).slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#00b050]/10 via-white to-[#00b050]/5 overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <svg className="w-4 h-4 text-[#00b050]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Premium Quality Flowers</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Fresh Flowers<br />
                <span className="font-comic text-[#00b050]">Delivered Daily</span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Hand-picked bouquets and garden plants, crafted with love. Browse our collection and order for collection. No account needed!
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
                  <span>Shop Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/promotions" className="btn-secondary inline-flex items-center gap-2">
                  <span>View Promotions</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-[#00b050]">500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#00b050]">100+</div>
                  <div className="text-sm text-gray-600">Flower Varieties</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#00b050]">24/7</div>
                  <div className="text-sm text-gray-600">Online Ordering</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80" 
                  alt="Beautiful flower arrangement"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00b050]/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#00b050]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Fresh Guarantee</div>
                    <div className="text-sm text-gray-600">100% Quality</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Shop by <span className="font-comic text-[#00b050]">Category</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our carefully curated collection of flowers and plants for every occasion
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  href={`/shop?cat=${category.slug}`}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-[#00b050]/5 to-[#00b050]/10 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg transition-shadow">
                      <svg className="w-8 h-8 text-[#00b050]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">Explore →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotions Section */}
      {activePromotions.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Special <span className="font-comic text-[#00b050]">Promotions</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don't miss out on our exclusive deals and seasonal offers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {activePromotions.map((promo) => (
                <Link 
                  key={promo.id}
                  href={promo.link}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={promo.image} 
                        alt={promo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {promo.badge}
                        </span>
                      </div>
                      {promo.discount && (
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                            <span className="text-2xl font-bold text-[#00b050]">{promo.discount}%</span>
                            <span className="text-sm text-gray-600 ml-1">OFF</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="text-sm text-[#00b050] font-semibold mb-2">{promo.subtitle}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{promo.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{promo.description}</p>
                      <div className="flex items-center text-[#00b050] font-semibold">
                        <span>Learn More</span>
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/promotions" className="btn-primary inline-flex items-center gap-2">
                <span>View All Promotions</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured <span className="font-comic text-[#00b050]">Products</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Handpicked selections from our finest collection
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/shop" className="btn-secondary inline-flex items-center gap-2">
                <span>Browse All Products</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-[#00b050]/5 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="font-comic text-[#00b050]">Us?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00b050]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#00b050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fresh Quality</h3>
              <p className="text-gray-600 text-sm">Hand-picked daily for maximum freshness</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#00b050]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#00b050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quick Service</h3>
              <p className="text-gray-600 text-sm">Fast order processing and collection</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#00b050]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#00b050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Competitive pricing with great value</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#00b050]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#00b050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Expert Care</h3>
              <p className="text-gray-600 text-sm">Professional handling and advice</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
