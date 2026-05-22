'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, cartCount, cartSubtotal, updateQuantity, removeFromCart } = useCart();
  const cartItems = Object.values(cart);

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-24 mt-0">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-comic text-gray-900 mb-4">
              Shopping Cart
            </h1>
            <nav className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-glass px-6 py-2 rounded-full mt-4 border border-gray-200">
              <Link href="/" className="text-gray-600 hover:text-primary text-sm">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-primary font-medium text-sm">Shopping Cart</span>
            </nav>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <svg
                className="w-24 h-24 text-gray-300 mx-auto mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-3xl font-comic text-gray-900 mb-4">Your cart is empty</h3>
              <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
              <Link href="/shop" className="btn-primary">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {/* Cart Items */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Total
                        </th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cartItems.map(({ product, quantity }) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={product.image_url || '/images/placeholder.jpg'}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(product.price)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden w-32">
                              <button
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                  updateQuantity(product.id, parseInt(e.target.value) || 0)
                                }
                                className="w-full text-center py-1 outline-none"
                                min="0"
                                max="99"
                              />
                              <button
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-primary">
                              {formatPrice(product.price * quantity)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Remove"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Link href="/shop" className="btn-secondary w-full text-center block">
                    Continue Shopping
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-comic text-gray-900 mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Items ({cartCount})</span>
                      <span>{formatPrice(cartSubtotal)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-4 flex justify-between text-xl font-bold">
                      <span>Subtotal</span>
                      <span className="text-primary">{formatPrice(cartSubtotal)}</span>
                    </div>
                  </div>
                  <Link href="/checkout" className="btn-primary w-full text-center block">
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
