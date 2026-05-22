'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, validateZimbabwePhone, cleanPhone } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, cartSubtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cartItems = Object.values(cart);

  if (cartItems.length === 0) {
    router.push('/shop');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validateZimbabwePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Zimbabwe mobile number (e.g. 0771234567)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: cleanPhone(formData.phone),
          cart: cartItems.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            product_price: item.product.price,
            quantity: item.quantity,
          })),
          subtotal: cartSubtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      clearCart();

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        router.push(`/confirmation?order_id=${data.order_id}&demo=1`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-24 mt-0">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-comic text-gray-900 mb-4">Checkout</h1>
            <nav className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-glass px-6 py-2 rounded-full mt-4 border border-gray-200">
              <Link href="/" className="text-gray-600 hover:text-primary text-sm">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/cart" className="text-gray-600 hover:text-primary text-sm">
                Cart
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-primary font-medium text-sm">Checkout</span>
            </nav>
          </div>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                  <h3 className="text-3xl font-comic text-gray-900 mb-2">Your Details</h3>
                  <p className="text-gray-600 mb-8">
                    No account needed. Just enter your name and phone number — we'll send a Paynow
                    payment prompt to your phone.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                          placeholder="John"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                          placeholder="Doe"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="0771234567"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                      <p className="mt-2 text-sm text-gray-500">
                        We'll send a Paynow / EcoCash payment prompt to this number.
                      </p>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Pay Now via Paynow
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-3xl shadow-lg border border-gray-200 p-8 sticky top-24">
                  <h3 className="text-2xl font-comic text-gray-900 mb-6">Your Order</h3>

                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cartItems.map(({ product, quantity }) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {product.name} <span className="text-gray-500">x {quantity}</span>
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(product.price * quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-300 pt-4 space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(cartSubtotal)}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm mb-1">
                          Paynow / EcoCash
                        </p>
                        <p className="text-xs text-gray-600">
                          Pay securely via Paynow. A payment prompt will be sent to your mobile
                          number. Supports EcoCash, OneMoney and Telecash.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link href="/cart" className="btn-secondary w-full text-center block">
                      ← Back to Cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
