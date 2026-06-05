import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to dynamically attach CORS headers based on the incoming request origin
function corsResponse(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = ['https://gardenguru.co.zw', 'https://www.gardenguru.co.zw'];
  
  // If the request comes from an allowed origin, echo it back. Otherwise, default to standard domain.
  const targetOrigin = allowedOrigins.includes(origin) ? origin : 'https://www.gardenguru.co.zw';

  response.headers.set('Access-Control-Allow-Origin', targetOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle the browser's preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return corsResponse(request, new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // FIX: Changed target from 'plants' to 'store_products'
    const { data: products, error } = await supabase
      .from('store_products')
      .select('id, name, description, price, image_url, category, stock_quantity')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase Error fetching products:', error.message, error.details);
      return corsResponse(
        request,
        NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
      );
    }

    return corsResponse(request, NextResponse.json(products || []));
  } catch (error: any) {
    console.error('Server Error in products API:', error);
    return corsResponse(
      request,
      NextResponse.json({ error: error?.message || 'Something went wrong' }, { status: 500 })
    );
  }
}
