import { NextRequest, NextResponse } from 'next/server';  
import { supabase } from '@/lib/supabase';  
import { generateOrderId } from '@/lib/utils';  
import { sendEmail, generateSimpleBankTransferEmail } from '@/lib/email';  
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
  
    let proofOfPaymentUrl: string | null = null;  
  
    // Try to upload file if provided, but don't fail if it doesn't work  
    if (proofOfPayment) {  
      // Validate file  
      if (proofOfPayment.size > MAX_FILE_SIZE) {  
        return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });  
      }  
  
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];  
      if (!allowedTypes.includes(proofOfPayment.type)) {  
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });  
      }  
  
      const orderId = generateOrderId();  
      console.log(`[${requestId}] Order ID: ${orderId}`);  
  
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
  
        if (!uploadError) {  
          const { data: urlData } = supabase.storage  
            .from('store-assets')  
            .getPublicUrl(filePath);  
          proofOfPaymentUrl = urlData.publicUrl;  
          console.log(`[${requestId}] File uploaded successfully: ${proofOfPaymentUrl}`);  
        } else {  
          console.warn(`[${requestId}] Upload failed (continuing without file):`, uploadError);  
        }  
      } catch (uploadErr) {  
        console.warn(`[${requestId}] Upload error (continuing without file):`, uploadErr);  
      }  
    } else {  
      console.log(`[${requestId}] No file provided, continuing without proof of payment`);  
    }  
  
    const orderId = generateOrderId();  
    console.log(`[${requestId}] Order ID: ${orderId}`);  
  
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
  
    if (proofOfPaymentUrl) {
      const itemsForEmail = cart.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.product_price,
      }));

      const emailHtml = generateSimpleBankTransferEmail(
        orderId,
        `${firstName} ${lastName}`,
        email,
        phone,
        itemsForEmail,
        subtotal,
        proofOfPaymentUrl
      );

      const emailResult = await sendEmail({
        to: 'tggsalesadministrator@gmail.com',
        subject: `New Bank Transfer Order #${orderId} - Proof of Payment Uploaded`,
        html: emailHtml,
      });

      console.log(`[${requestId}] Email notification:`, emailResult.success ? 'sent' : 'failed to send');
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