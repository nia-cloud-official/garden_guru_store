import Link from 'next/link';
import promotionsData from '@/data/promotions.json';

export default function PromotionsPage() {
  const activePromotions = promotionsData.promotions.filter(p => p.active);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#00b050]/10 via-white to-[#00b050]/5 py-16 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-4 shadow-sm border border-gray-200">
              <svg className="w-4 h-4 text-[#00b050]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Limited Time Offers</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Special <span className="font-comic text-[#00b050]">Promotions</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our exclusive deals and seasonal offers. Save big on your favorite flowers and plants!
            </p>
          </div>
        </div>
      </section>

      {/* Promotions Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {activePromotions.length === 0 ? (
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <h4 className="text-2xl font-comic text-gray-900 mb-4">
                No Active Promotions
              </h4>
              <p className="text-gray-600 mb-6">Check back soon for exciting deals!</p>
              <Link href="/shop" className="btn-primary inline-block">
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activePromotions.map((promo) => (
                <Link 
                  key={promo.id}
                  href={promo.link}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={promo.image} 
                        alt={promo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {promo.badge}
                        </span>
                      </div>
                      
                      {promo.discount && (
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                            <span className="text-3xl font-bold text-[#00b050]">{promo.discount}%</span>
                            <span className="text-sm text-gray-600 ml-1">OFF</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="text-sm text-[#00b050] font-semibold mb-2">{promo.subtitle}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{promo.title}</h3>
                      <p className="text-gray-600 mb-4">{promo.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          Valid until {new Date(promo.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center text-[#00b050] font-semibold">
                          <span>Shop Now</span>
                          <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#00b050]/5 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Don't Miss Out!
            </h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter to get notified about new promotions and exclusive deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
