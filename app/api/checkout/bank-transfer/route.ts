import { NextRequest, NextResponse } from 'next/server';  
import { supabase } from '@/lib/supabase';  
import { generateOrderId } from '@/lib/utils';  
import type { Database } from '@/types/database';  
  
type OrderInsert = Database['public']['Tables']['store_orders']['Insert'];  
type OrderItemInsert = Database['public']['Tables']['store_order_items']['Insert'];  
  
interface CartItem {  
  product_id: number;  
  product_name: string;  
  product_price: number;  
  quantity: number;  
}  
  
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB  
  
export async function POST(request: NextRequest) {  
  const requestId = `bank-${Date.now()}`;  
  console.log(`[${requestId}] Bank transfer started`);  
  
  try {  
    const formData = await request.formData();  
      
    const firstName = formData.get('firstName') as string;  
    const lastName = formData.get('lastName') as string;  
    const email = formData.get('email') as string;  
    const phone = formData.get('phone') as string;  
    const cartJson = formData.get('cart') as string;  
    const subtotalStr = formData.get('subtotal') as string;  
    const proofOfPayment = formData.get('proofOfPayment') as File | null;  
  
    // Validation (file is now optional)  
    if (!firstName || !lastName || !email || !phone || !cartJson || !subtotalStr) {  
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });  
    }  
  
    const cart: CartItem[] = JSON.parse(cartJson);  
    const subtotal = parseFloat(subtotalStr);  
  
    if (cart.length === 0) {  
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });  
    }  

    // Generate order ID upfront (needed for both file upload and order creation)
    const orderId = generateOrderId();
    console.log(`[${requestId}] Order ID: ${orderId}`);
  
    let proofOfPaymentUrl: string | null = null;  
  
    // Upload file if provided - this is now required
    if (!proofOfPayment) {
      return NextResponse.json({ error: 'Proof of payment is required' }, { status: 400 });
    }
  
    // Validate file
    if (proofOfPayment.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }
  
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(proofOfPayment.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
  
    const fileExt = proofOfPayment.name.split('.').pop();
    const fileName = `${orderId}_${Date.now()}.${fileExt}`;
    const filePath = `proof-of-payments/${fileName}`;
  
    const fileBuffer = await proofOfPayment.arrayBuffer();
      
    try {
      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, fileBuffer, {
          contentType: proofOfPayment.type,
          upsert: false,
        });
  
      if (uploadError) {
        console.error(`[${requestId}] Upload failed:`, uploadError);
        return NextResponse.json({ error: 'Failed to upload proof of payment' }, { status: 500 });
      }
  
      const { data: urlData } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);
      proofOfPaymentUrl = urlData.publicUrl;
      console.log(`[${requestId}] File uploaded successfully: ${proofOfPaymentUrl}`);
    } catch (uploadErr) {
      console.error(`[${requestId}] Upload error:`, uploadErr);
      return NextResponse.json({ error: 'Failed to upload proof of payment' }, { status: 500 });
    }  
  
      console.log(`[${requestId}] Order ID: ${orderId}`);
  
    // Auto-create customer account if doesn't exist
    try {
      const { data: existingCustomer } = await supabase
        .from('store_customers')
        .select('id, email')
        .eq('email', email)
        .single();

      if (!existingCustomer) {
        console.log(`[${requestId}] Creating new customer account for ${email}`);
        const { data: newCustomer, error: customerError } = await supabase
          .from('store_customers')
          .insert({
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (customerError) {
          console.warn(`[${requestId}] Could not create customer account:`, customerError);
        } else {
          console.log(`[${requestId}] Customer account created: ${newCustomer.id}`);
        }
      } else {
        console.log(`[${requestId}] Customer exists: ${existingCustomer.id}`);
      }
    } catch (customerErr) {
      console.warn(`[${requestId}] Customer creation error (continuing):`, customerErr);
    }
  
    // Create order (with or without proof of payment URL)  
    const orderInsert: OrderInsert = {  
      order_number: orderId,  
      first_name: firstName,  
      last_name: lastName,  
      email,  
      phone,  
      subtotal,  
      total_amount: subtotal,  
      status: 'pending_payment',  
      payment_method: 'bank',  
      payment_status: 'pending',  
      proof_of_payment_url: proofOfPaymentUrl,  
    };  
  
    const { data: orderData, error: orderError } = await supabase  
      .from('store_orders')  
      .insert(orderInsert as any)  
      .select()  
      .single();  
  
    if (orderError || !orderData) {  
      console.error(`[${requestId}] Order error:`, orderError);  
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });  
    }  
  
    // Create order items  
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
      console.error(`[${requestId}] Items error:`, itemsError);  
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });  
    }  
  
    console.log(`[${requestId}] Complete - Order: ${orderId}`);  
    console.log(`[${requestId}] Customer: ${firstName} ${lastName}, ${email}, ${phone}`);  
    console.log(`[${requestId}] Proof of payment: ${proofOfPaymentUrl || 'None'}`);  
    console.log(`[${requestId}] ⚠️ ADMIN ACTION REQUIRED: Check order in ERP and call customer at ${phone}`);
  
    // Send email notification to gardenguru10@gmail.com
    try {
      const { sendEmail, generateSimpleBankTransferEmail } = await import('@/lib/email');
      
      const emailHtml = generateSimpleBankTransferEmail(
        orderId,
        `${firstName} ${lastName}`,
        email,
        phone,
        cart.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.product_price
        })),
        subtotal,
        proofOfPaymentUrl || 'No proof of payment uploaded'
      );

      await sendEmail({
        to: 'gardenguru10@gmail.com',
        subject: `New Bank Transfer Order #${orderId}`,
        html: emailHtml
      });

      console.log(`[${requestId}] Email sent to gardenguru10@gmail.com`);
    } catch (emailError) {
      console.error(`[${requestId}] Failed to send email:`, emailError);
      // Don't fail the request if email fails
    }
  
    return NextResponse.json({  
      success: true,  
      order_id: orderId,  
    });  
  } catch (error: any) {  
    console.error(`[${requestId}] Error:`, error);  
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });  
  }  
}