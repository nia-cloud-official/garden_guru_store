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
      redirectUrl: paynowResult.redirectUrl ? 'present' : 'missing',
      pollUrl: paynowResult.pollUrl ? 'present' : 'missing',
      transactionId: paynowResult.transactionId,
    });

    // Update order with PayNow details if available
    if (paynowResult.pollUrl || paynowResult.transactionId) {
      console.log(`[${requestId}] Updating order with Paynow details`);
      try {
        const updatePayload: OrderUpdate = {};
        if (paynowResult.pollUrl) updatePayload.paynow_poll_url = paynowResult.pollUrl;
        if (paynowResult.transactionId) updatePayload.paynow_reference = paynowResult.transactionId;

        const { error: updateError } = await supabase
          .from('store_orders')
          .update(updatePayload)
          .eq('id', (orderData as any).id);

        if (updateError) {
          console.error(`[${requestId}] Error updating order with Paynow details:`, updateError);
        } else {
          console.log(`[${requestId}] Order updated with Paynow details successfully`);
        }
      } catch (err) {
        console.error(`[${requestId}] Exception while updating order with Paynow details:`, err);
      }
    }

    const totalDuration = Date.now() - checkoutStartTime;
    console.log(`[${requestId}] Checkout completed successfully (total: ${totalDuration}ms)`, {
      orderId,
      hasPollUrl: !!paynowResult.pollUrl,
    });

    // Build and return response - ensure all values are serializable
    let responsePayload: any = {
      success: true,
      order_id: String(orderId),
    };

    // Safely add optional fields
    try {
      if (paynowResult.pollUrl) {
        const pollUrl = String(paynowResult.pollUrl);
        if (pollUrl && pollUrl !== 'undefined' && pollUrl !== 'null') {
          responsePayload.poll_url = pollUrl;
        }
      }
    } catch (e) {
      console.warn(`[${requestId}] Could not extract poll_url:`, e);
    }

    try {
      if (paynowResult.redirectUrl) {
        const redirectUrl = String(paynowResult.redirectUrl);
        if (redirectUrl && redirectUrl !== 'undefined' && redirectUrl !== 'null') {
          responsePayload.redirect_url = redirectUrl;
        }
      }
    } catch (e) {
      console.warn(`[${requestId}] Could not extract redirect_url:`, e);
    }

    console.log(`[${requestId}] Final response payload:`, {
      success: responsePayload.success,
      order_id: responsePayload.order_id,
      poll_url: responsePayload.poll_url ? 'present' : 'absent',
      redirect_url: responsePayload.redirect_url ? 'present' : 'absent',
    });

    // Ensure clean object before serialization
    const cleanPayload = JSON.parse(JSON.stringify(responsePayload));
    
    return NextResponse.json(cleanPayload, { status: 200 });
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
