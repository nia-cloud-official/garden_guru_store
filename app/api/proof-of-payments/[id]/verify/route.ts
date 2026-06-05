import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    // Update the order payment status to 'paid'
    const { error } = await supabase
      .from('store_orders')
      .update({ 
        payment_status: 'paid',
        status: 'processing'
      } as any)
      .eq('id', orderId);

    if (error) {
      console.error('Error verifying payment:', error);
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in verify API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
