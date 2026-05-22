import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOrderId } from '@/lib/utils';
import type { Database } from '@/types/database';

type OrderInsert = Database['public']['Tables']['store_orders']['Insert'];
type OrderItemInsert = Database['public']['Tables']['store_order_items']['Insert'];

interface CartItem {
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface CheckoutRequest {
  firstName: string;
  lastName: string;
  phone: string;
  cart: CartItem[];
  subtotal: number;
}

async function initiatePaynow(
  orderId: string,
  customerName: string,
  phone: string,
  amount: number,
  cart: CartItem[]
): Promise<{ success: boolean; redirect_url?: string; error?: string }> {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
  const returnUrl = process.env.NEXT_PUBLIC_PAYNOW_RETURN_URL;
  const resultUrl = process.env.PAYNOW_RESULT_URL;

  if (!integrationId || integrationId === 'YOUR_INTEGRATION_ID') {
    return { success: false, error: 'Paynow not configured' };
  }

  const items = cart.map((item) => `${item.product_name} x${item.quantity}`).join(', ');

  const fields: Record<string, string> = {
    id: integrationId,
    reference: orderId,
    amount: amount.toFixed(2),
    additionalinfo: items,
    returnurl: `${returnUrl}?order_id=${encodeURIComponent(orderId)}`,
    resulturl: resultUrl || '',
    authemail: '',
    phone: phone,
    method: 'ecocash',
    status: 'Message',
  };

  const hashString = Object.values(fields).join('') + integrationKey;
  const crypto = require('crypto');
  const hash = crypto.createHash('sha512').update(hashString).digest('hex').toUpperCase();
  fields.hash = hash;

  try {
    const formBody = new URLSearchParams(fields).toString();
    const response = await fetch('https://www.paynow.co.zw/interface/remotetransaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });

    const responseText = await response.text();
    const result: Record<string, string> = {};
    responseText.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      result[key] = decodeURIComponent(value || '');
    });

    if (result.status?.toLowerCase() === 'ok') {
      return {
        success: true,
        redirect_url: result.browserurl || '',
      };
    }

    return { success: false, error: result.error || 'Unknown Paynow error' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { firstName, lastName, phone, cart, subtotal } = body;

    // Validate input
    if (!firstName || !lastName || !phone || !cart || cart.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create order in database
    const orderInsert: OrderInsert = {
      order_number: orderId,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      subtotal: subtotal,
      total_amount: subtotal,
      status: 'pending_payment',
      payment_method: 'paynow',
      payment_status: 'pending',
    };

    const { data: orderData, error: orderError } = await supabase
      .from('store_orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItems: OrderItemInsert[] = cart.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      line_total: item.product_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('store_order_items').insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    // Initiate Paynow payment
    const paynowResult = await initiatePaynow(
      orderId,
      `${firstName} ${lastName}`,
      phone,
      subtotal,
      cart
    );

    if (paynowResult.success && paynowResult.redirect_url) {
      return NextResponse.json({
        success: true,
        order_id: orderId,
        redirect_url: paynowResult.redirect_url,
      });
    }

    // If Paynow fails or is not configured, return demo mode
    return NextResponse.json({
      success: true,
      order_id: orderId,
      demo: true,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
