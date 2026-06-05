import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch products from plants table (since store_products might not have data)
    const { data: products, error } = await supabase
      .from('plants')
      .select('id, name, description, price, image_url, category, stock_quantity')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
