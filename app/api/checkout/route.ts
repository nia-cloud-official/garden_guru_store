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
  email: string;
  phone: string;
  paymentMethod: PaynowPaymentMethod;
  cart: CartItem[];
  subtotal: number;
}

const validPaymentMethods: PaynowPaymentMethod[] = ['ecocash', 'paynow'];

export async function POST(request: NextRequest) {
  const checkoutStartTime = Date.now();
  const requestId = `checkout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`[${requestId}] Checkout request started`, {
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
  });
  
  try {
    const body: CheckoutRequest = await request.json();
    const { firstName, lastName, email, phone, paymentMethod, cart, subtotal } = body;

    console.log(`[${requestId}] Request body parsed`, {
      firstName,
      lastName,
      email,
      phone,
      paymentMethod,
      cartItemsCount: cart?.length,
      subtotal,
    });

    if (!firstName || !lastName || !email || !phone || !paymentMethod || !cart || cart.length === 0) {
      console.log(`[${requestId}] Validation failed - missing required fields`);
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      console.log(`[${requestId}] Invalid payment method: ${paymentMethod}`);
      return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 });
    }

    if (!isPaynowConfigured()) {
      console.error(`[${requestId}] Paynow not configured`);
      return NextResponse.json(
        {
          error:
            'Paynow is not configured. Set PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, NEXT_PUBLIC_PAYNOW_RETURN_URL, and PAYNOW_RESULT_URL.',
        },
        { status: 500 }
      );
    }

    const orderId = generateOrderId();
    console.log(`[${requestId}] Generated order ID: ${orderId}`);

    const orderInsert: OrderInsert = {
      order_number: orderId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone,
      subtotal,
      total_amount: subtotal,
      status: 'pending_payment',
      payment_method: paymentMethod,
      payment_status: 'pending',
    };

    console.log(`[${requestId}] Creating order in database`);
    const dbStartTime = Date.now();
    const { data: orderData, error: orderError } = await supabase
      .from('store_orders')
      .insert(orderInsert as any)
      .select()
      .single();
    const dbDuration = Date.now() - dbStartTime;

    if (orderError || !orderData) {
      console.error(`[${requestId}] Error creating order (${dbDuration}ms):`, orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
    
    console.log(`[${requestId}] Order created successfully (${dbDuration}ms):`, {
      orderId: (orderData as any).id,
    });

    const orderItems: OrderItemInsert[] = cart.map((item) => ({
      order_id: (orderData as any).id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      line_total: item.product_price * item.quantity,
    }));

    console.log(`[${requestId}] Creating ${orderItems.length} order items`);
    const itemsStartTime = Date.now();
    const { error: itemsError } = await supabase.from('store_order_items').insert(orderItems as any);
    const itemsDuration = Date.now() - itemsStartTime;

    if (itemsError) {
      console.error(`[${requestId}] Error creating order items (${itemsDuration}ms):`, itemsError);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }
    
    console.log(`[${requestId}] Order items created successfully (${itemsDuration}ms)`);

    console.log(`[${requestId}] Initiating Paynow payment`);
    const paynowStartTime = Date.now();
    const paynowResult = await initiatePaynow(
      orderId,
      `${firstName} ${lastName}`,
      email,
      phone,
      subtotal,
      cart,
      paymentMethod,
      requestId
    );
    const paynowDuration = Date.now() - paynowStartTime;

    if (!paynowResult.success) {
      console.error(`[${requestId}] Paynow initiation failed (${paynowDuration}ms):`, {
        error: paynowResult.error,
        fullResult: paynowResult,
      });
      return NextResponse.json({ error: paynowResult.error || 'Paynow checkout failed' }, { status: 502 });
    }
    
    console.log(`[${requestId}] Paynow payment initiated successfully (${paynowDuration}ms):`, {
      pollUrl: paynowResult.pollUrl ? 'present' : 'absent',
    });

    const totalDuration = Date.now() - checkoutStartTime;
    console.log(`[${requestId}] Checkout completed successfully (total: ${totalDuration}ms)`);

    // DEBUG: Log the paynow result structure
    console.log(`[${requestId}] DEBUG - paynowResult object:`, {
      success: paynowResult.success,
      pollUrlType: typeof paynowResult.pollUrl,
      pollUrlValue: paynowResult.pollUrl,
      redirectUrlType: typeof paynowResult.redirectUrl,
      redirectUrlValue: paynowResult.redirectUrl,
      transactionIdType: typeof paynowResult.transactionId,
      transactionIdValue: paynowResult.transactionId,
      keys: Object.keys(paynowResult),
    });

    const responsePayload = {
      success: true,
      order_id: orderId,
      ...(paynowResult.pollUrl && { poll_url: paynowResult.pollUrl }),
      ...(paynowResult.redirectUrl && { redirect_url: paynowResult.redirectUrl }),
    };

    // DEBUG: Log the response payload before serialization
    console.log(`[${requestId}] DEBUG - responsePayload before JSON:`, {
      keys: Object.keys(responsePayload),
      successType: typeof responsePayload.success,
      orderIdType: typeof responsePayload.order_id,
      pollUrlType: typeof responsePayload.poll_url,
      redirectUrlType: typeof responsePayload.redirect_url,
    });

    // Try to serialize and catch any errors
    try {
      const serialized = JSON.stringify(responsePayload);
      console.log(`[${requestId}] DEBUG - Serialized successfully, length: ${serialized.length} bytes`);
    } catch (serializeErr) {
      console.error(`[${requestId}] DEBUG - Serialization error:`, serializeErr);
      return NextResponse.json({ error: 'Failed to serialize response', details: String(serializeErr) }, { status: 500 });
    }

    console.log(`[${requestId}] Returning response`);
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    const totalDuration = Date.now() - checkoutStartTime;
    console.error(`[${requestId}] Checkout error (${totalDuration}ms):`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
