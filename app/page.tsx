import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

async function getFeaturedProducts(): Promise<any[]> {
  const { data, error } = await supabase
    .from('store_products')
    .select('*')
    .eq('is_active', true)
    .limit(8);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export default async function HomePage() {
  const featuredProducts: any[] = await getFeaturedProducts();

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.jpg"
            alt="Fresh flowers"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.72))' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1 mb-4 bg-white/70 backdrop rounded-full px-4 py-2 shadow-lg border border-gray-200">
              <span className="text-primary font-medium tracking-wide" style={{ color: "#ffff"}}>Fresh from the Garden</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-comic text-white mb-6 leading-tight">
              Transform Your Outdoor Space
            </h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              Hand-picked bouquets and garden plants, crafted with love. No account needed — just pick, pay, and collect.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="inline-flex items-center gap-2 bg-[#00b050] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl">
                Shop Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#products" className="inline-block bg-white text-[#00b050] px-6 py-3 rounded-full font-semibold">
                View Products
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-comic text-gray-900 mb-4">
              Trending Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hand-picked just for you
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/shop" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/hero.jpg"
            alt="Background"
            fill
            className="object-cover"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-comic text-white mb-4">
              How It Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-glass rounded-full inline-flex items-center justify-center mb-6 border-2 border-white/30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-2xl font-comic mb-4">1. Pick Your Flowers</h4>
              <p className="text-white/90 leading-relaxed">
                Browse our fresh selection and add whatever you love to your cart.
              </p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-glass rounded-full inline-flex items-center justify-center mb-6 border-2 border-white/30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-2xl font-comic mb-4">2. Pay via Paynow</h4>
              <p className="text-white/90 leading-relaxed">
                Enter your name and phone number. We'll send a Paynow payment prompt straight to your phone.
              </p>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-glass rounded-full inline-flex items-center justify-center mb-6 border-2 border-white/30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-2xl font-comic mb-4">3. Collect & Enjoy</h4>
              <p className="text-white/90 leading-relaxed">
                Once payment is confirmed, your receipt is ready. Come collect your flowers!
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/shop" className="bg-white text-primary px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition-all duration-200 inline-block">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-glass rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 text-center">
            <h3 className="text-3xl md:text-4xl font-comic text-gray-900 mb-4">
              Stay in the Loop
            </h3>
            <p className="text-gray-600 mb-8">
              Get notified about new arrivals, seasonal specials and garden tips.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
