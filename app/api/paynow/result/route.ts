import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parsePaynowResponse } from '@/lib/paynow';
import type { Database } from '@/types/database';

type OrderUpdate = Database['public']['Tables']['store_orders']['Update'];

async function extractPayload(request: NextRequest): Promise<Record<string, string>> {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return (await request.json()) as Record<string, string>;
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await request.text();
    return parsePaynowResponse(text);
  }

  if (contentType.includes('multipart/form-data')) {
    const data = await request.formData();
    const payload: Record<string, string> = {};
    data.forEach((value, key) => {
      payload[key] = String(value);
    });
    return payload;
  }

  const url = new URL(request.url);
  const payload: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    payload[key] = value;
  });
  return payload;
}

function normalizePaynowStatus(status?: string): { paymentStatus: string; orderStatus: string } {
  const normalized = String(status || '').trim().toLowerCase();

  if (normalized === 'ok') {
    return { paymentStatus: 'paid', orderStatus: 'completed' };
  }

  if (normalized === 'pending' || normalized === 'message') {
    return { paymentStatus: 'pending', orderStatus: 'pending_payment' };
  }

  return { paymentStatus: 'failed', orderStatus: 'payment_failed' };
}

async function handleUpdate(payload: Record<string, string>) {
  const reference = payload.reference || payload.order_id || payload.transaction;
  if (!reference) {
    return NextResponse.json({ error: 'Missing Paynow reference' }, { status: 400 });
  }

  const { data: orderData, error: orderError } = await supabase
    .from('store_orders')
    .select('id')
    .eq('order_number', reference)
    .single();

  if (orderError || !orderData) {
    return NextResponse.json({ error: 'Order not found for Paynow reference' }, { status: 404 });
  }

  const { paymentStatus, orderStatus } = normalizePaynowStatus(payload.status);

  const updates: OrderUpdate = {
    payment_status: paymentStatus,
    status: orderStatus,
  };

  if (payload.pollurl) {
    updates.paynow_poll_url = payload.pollurl;
  }

  if (payload.transaction) {
    updates.paynow_reference = payload.transaction;
  } else if (payload.reference) {
    updates.paynow_reference = payload.reference;
  }

  const orderTable = supabase.from('store_orders') as any;
  const { error: updateError } = await orderTable.update(updates).eq('id', (orderData as any).id as number);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }

  return NextResponse.json({ success: true, payment_status: paymentStatus, order_status: orderStatus });
}

export async function POST(request: NextRequest) {
  const payload = await extractPayload(request);
  return handleUpdate(payload);
}

export async function GET(request: NextRequest) {
  const payload = await extractPayload(request);
  return handleUpdate(payload);
}
