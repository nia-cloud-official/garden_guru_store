'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart } from '@/types/cart';
import { Product } from '@/types/database';
import * as cartLib from '@/lib/cart';

interface CartContextType {
  cart: Cart;
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);

  useEffect(() => {
    const initialCart = cartLib.getCart();
    setCart(initialCart);
    updateCartStats(initialCart);
  }, []);

  const updateCartStats = (updatedCart: Cart) => {
    setCartCount(cartLib.getCartCount(updatedCart));
    setCartSubtotal(cartLib.getCartSubtotal(updatedCart));
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const updatedCart = cartLib.addToCart(product, quantity);
    setCart(updatedCart);
    updateCartStats(updatedCart);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const updatedCart = cartLib.updateCartQuantity(productId, quantity);
    setCart(updatedCart);
    updateCartStats(updatedCart);
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cartLib.removeFromCart(productId);
    setCart(updatedCart);
    updateCartStats(updatedCart);
  };

  const clearCart = () => {
    cartLib.clearCart();
    setCart({});
    setCartCount(0);
    setCartSubtotal(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
