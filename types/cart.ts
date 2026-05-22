import { Product } from './database';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  [productId: number]: CartItem;
}
