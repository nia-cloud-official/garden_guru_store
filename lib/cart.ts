'use client';

import { Cart, CartItem } from '@/types/cart';
import { Product } from '@/types/database';

const CART_STORAGE_KEY = 'garden_guru_cart';

export function getCart(): Cart {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function addToCart(product: Product, quantity: number = 1): Cart {
  const cart = getCart();
  
  if (cart[product.id]) {
    cart[product.id].quantity += quantity;
  } else {
    cart[product.id] = { product, quantity };
  }
  
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(productId: number, quantity: number): Cart {
  const cart = getCart();
  
  if (quantity <= 0) {
    delete cart[productId];
  } else if (cart[productId]) {
    cart[productId].quantity = quantity;
  }
  
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: number): Cart {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

export function getCartCount(cart: Cart): number {
  return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(cart: Cart): number {
  return Object.values(cart).reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
}
