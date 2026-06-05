import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to attach required CORS headers to any response
function corsResponse(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://gardenguru.co.zw');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle the browser's preflight OPTIONS request
export async function OPTIONS() {
  return corsResponse(new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch products from plants table
    const { data: products, error } = await supabase
      .from('plants')
      .select('id, name, description, price, image_url, category, stock_quantity')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase Error fetching products:', error.message, error.details);
      return corsResponse(
        NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
      );
    }

    return corsResponse(NextResponse.json(products || []));
  } catch (error: any) {
    console.error('Server Error in products API:', error);
    return corsResponse(
      NextResponse.json({ error: error?.message || 'Something went wrong' }, { status: 500 })
    );
  }
}
