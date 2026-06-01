'use client';

import { Mail, Check } from 'lucide-react';
import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // Simulate subscription
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-[#00b050] to-[#009040]">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Mail size={32} className="text-white" />
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            Get Fresh Deals Weekly
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Subscribe to our newsletter for exclusive discounts, new arrivals, and gardening tips delivered to your inbox.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full">
              <Check size={20} className="text-[#00b050]" />
              <span className="font-semibold text-gray-900">Thanks for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-3 rounded-full bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-[#00b050] font-bold rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}

          {error && <p className="text-red-200 text-sm mt-3">{error}</p>}

          <p className="text-sm text-white/70 mt-4">
            No spam, just great deals and gardening tips. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
