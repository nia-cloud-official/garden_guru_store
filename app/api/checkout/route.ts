import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOrderId } from '@/lib/utils';
import { initiatePaynow, isPaynowConfigured, PaynowPaymentMethod } from '@/lib/paynow';
import type { Database } from '@/types/database';

type OrderInsert = Database['public']['Tables']['store_orders']['Insert'];
type OrderItemInsert = Database['public']['Tables']['store_order_items']['Insert'];
type OrderUpdate = Database['public']['Tables']['store_orders']['Update'];

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
  paymentMethod: PaynowPaymentMethod;
  cart: CartItem[];
  subtotal: number;
}

const validPaymentMethods: PaynowPaymentMethod[] = ['ecocash', 'paynow'];

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { firstName, lastName, phone, paymentMethod, cart, subtotal } = body;

    if (!firstName || !lastName || !phone || !paymentMethod || !cart || cart.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 });
    }

    if (!isPaynowConfigured()) {
      return NextResponse.json(
        {
          error:
            'Paynow is not configured. Set PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, NEXT_PUBLIC_PAYNOW_RETURN_URL, and PAYNOW_RESULT_URL.',
        },
        { status: 500 }
      );
    }

    const orderId = generateOrderId();

    const orderInsert: OrderInsert = {
      order_number: orderId,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      subtotal,
      total_amount: subtotal,
      status: 'pending_payment',
      payment_method: paymentMethod,
      payment_status: 'pending',
    };

    const { data: orderData, error: orderError } = await supabase
      .from('store_orders')
      .insert(orderInsert as any)
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const orderItems: OrderItemInsert[] = cart.map((item) => ({
      order_id: (orderData as any).id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      line_total: item.product_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('store_order_items').insert(orderItems as any);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    const paynowResult = await initiatePaynow(
      orderId,
      `${firstName} ${lastName}`,
      phone,
      subtotal,
      cart,
      paymentMethod
    );

    if (!paynowResult.success) {
      console.error('Paynow initiation failed:', paynowResult.error);
      return NextResponse.json({ error: paynowResult.error || 'Paynow checkout failed' }, { status: 502 });
    }

    const updatePayload: OrderUpdate = {};
    if (paynowResult.pollUrl) updatePayload.paynow_poll_url = paynowResult.pollUrl;
    if (paynowResult.transactionId) updatePayload.paynow_reference = paynowResult.transactionId;

    if (Object.keys(updatePayload).length > 0) {
      const orderTable = supabase.from('store_orders') as any;
      await orderTable.update(updatePayload).eq('id', (orderData as any).id);
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      redirect_url: paynowResult.redirectUrl,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
