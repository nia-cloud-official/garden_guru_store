import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import promotionsData from '@/data/promotions.json';

async function getProducts(category?: string) {
  let query = supabase
    .from('store_products')
    .select(`
      *,
      store_categories!store_products_category_id_fkey(name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (category) {
    // Get category ID first
    const { data: categoryData } = await supabase
      .from('store_categories')
      .select('id')
      .eq('slug', category)
      .single();
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

async function getCategories() {
  const { data, error } = await supabase
    .from('store_categories')
    .select('name, slug')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const activeCategory = searchParams.cat || '';
  const products = await getProducts(activeCategory);
  const categories = await getCategories();
  const activePromotions = promotionsData.promotions.filter(p => p.active).slice(0, 3);

  return (
    <>
 {/* Shop Hero */}
<section className="relative py-20 border-b border-gray-100 overflow-hidden">
  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/images/flowers-hero.jpg')",
    }}
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/40" />

  {/* Content */}
  <div className="relative z-10 container mx-auto px-4">
    <div className="max-w-4xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-4 shadow-sm">
        <svg
          className="w-4 h-4 text-[#00b050]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          Fresh from the Garden
        </span>
      </div>

      <h1 className="text-4xl md:text-6xl font-comic text-white mb-4">
        Fresh Flowers & Plants
      </h1>

      <p className="text-lg text-white/90 max-w-2xl mx-auto">
        Hand-picked bouquets and garden plants, crafted with love. Browse our
        collection and order for collection.
      </p>
    </div>
  </div>
</section>

      {/* Shop Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-glass rounded-3xl p-6 border border-gray-200 shadow-lg sticky top-24">
                <h3 className="text-2xl font-comic text-gray-900 mb-6">
                  Categories
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      className={`block px-4 py-3 rounded-xl transition-all ${
                        activeCategory === ''
                          ? 'bg-primary text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All
                      <span className="float-right text-sm opacity-80">
                        ({products.length})
                      </span>
                    </Link>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/shop?cat=${cat.slug}`}
                        className={`block px-4 py-3 rounded-xl transition-all ${
                          activeCategory === cat.slug
                            ? 'bg-primary text-white font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-8 p-4 bg-white/80 backdrop-blur-glass rounded-2xl border border-gray-200">
                <p className="text-gray-600">
                  Showing <strong className="text-gray-900">{products.length}</strong> product
                  {products.length !== 1 ? 's' : ''}
                  {activeCategory && (
                    <span>
                      {' '}in <strong className="text-primary">{activeCategory}</strong>
                    </span>
                  )}
                </p>
              </div>

              {products.length === 0 ? (
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
                  <h4 className="text-2xl font-comic text-gray-900 mb-4">
                    No products found
                  </h4>
                  <Link href="/shop" className="btn-primary inline-block">
                    View All
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
    </>
  );
}
