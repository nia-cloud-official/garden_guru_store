import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // optional filter by status

    // Fetch orders with proof of payment
    let query = supabase
      .from('store_orders')
      .select('id, order_number, first_name, last_name, email, phone, total_amount, proof_of_payment_url, payment_status, created_at')
      .not('proof_of_payment_url', 'is', null)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('payment_status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching proof of payments:', error);
      return NextResponse.json({ error: 'Failed to fetch proof of payments' }, { status: 500 });
    }

    // Transform data to match POP inbox interface
    const submissions = orders?.map(order => ({
      id: order.id.toString(),
      order_number: order.order_number,
      customer_name: `${order.first_name} ${order.last_name}`,
      customer_email: order.email || '',
      customer_phone: order.phone,
      amount: order.total_amount,
      proof_of_payment_url: order.proof_of_payment_url,
      status: order.payment_status === 'paid' ? 'verified' : order.payment_status === 'rejected' ? 'rejected' : 'pending',
      submitted_at: order.created_at,
    })) || [];

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error in proof-of-payments API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
