import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { reason } = body;

    // Update the order payment status to 'rejected'
    const { error } = await supabase
      .from('store_orders')
      .update({ 
        payment_status: 'rejected',
        status: 'cancelled',
        notes: reason
      } as any)
      .eq('id', orderId);

    if (error) {
      console.error('Error rejecting payment:', error);
      return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reject API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
