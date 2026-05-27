import Link from 'next/link';
import { notFound } from 'next/navigation';
import promotionsData from '@/data/promotions.json';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

async function getPromotionProducts() {
  const { data, error } = await supabase
    .from('store_products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export default async function PromotionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const promotion = promotionsData.promotions.find(p => p.id === params.slug);
  
  if (!promotion) {
    notFound();
  }

  const products = await getPromotionProducts();

  return (
    <>
      {/* Promotion Hero */}
      <section className="relative bg-gradient-to-br from-[#00b050]/10 via-white to-[#00b050]/5 overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-red-600">{promotion.badge}</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                {promotion.title}
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {promotion.description}
              </p>

              {promotion.discount && (
                <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#00b050]">{promotion.discount}%</div>
                    <div className="text-sm text-gray-600">OFF</div>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <div className="text-sm text-gray-600">Valid Until</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(promotion.endDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
                  <span>Shop Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/promotions" className="btn-secondary inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>All Promotions</span>
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={promotion.image} 
                  alt={promotion.title}
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured in this <span className="font-comic text-[#00b050]">Promotion</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of products included in this special offer
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-glass rounded-3xl border border-gray-200">
              <p className="text-gray-600">No products available at the moment.</p>
              <Link href="/shop" className="btn-primary inline-block mt-6">
                Browse All Products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/shop" className="btn-secondary inline-flex items-center gap-2">
                  <span>View All Products</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Terms & Conditions</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00b050] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Promotion valid from {new Date(promotion.startDate).toLocaleDateString()} to {new Date(promotion.endDate).toLocaleDateString()}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00b050] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Discount applies to selected products only</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00b050] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Cannot be combined with other offers</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00b050] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Subject to availability while stocks last</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#00b050] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>The Garden Guru reserves the right to modify or cancel this promotion at any time</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
