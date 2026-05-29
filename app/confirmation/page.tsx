'use client';  
  
import { useEffect, useState, Suspense } from 'react';  
import { useSearchParams } from 'next/navigation';  
import Link from 'next/link';  
import { supabase } from '@/lib/supabase';  
import { formatPrice } from '@/lib/utils';  
  
export const dynamic = 'force-dynamic';  
  
interface OrderDetails {  
  order_number: string;  
  first_name: string;  
  last_name: string;  
  phone: string;  
  subtotal: number;  
  status: string;  
  payment_status: string;  
  created_at: string;  
  items: Array<{  
    product_name: string;  
    product_price: number;  
    quantity: number;  
    line_total: number;  
  }>;  
}  
  
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'unknown';  
  
function ConfirmationContent() {  
  const searchParams = useSearchParams();  
  const orderId = searchParams.get('order_id');  
  const pollUrl = searchParams.get('poll_url');  
  const isDemo = searchParams.get('demo') === '1';  
    
  const [order, setOrder] = useState<OrderDetails | null>(null);  
  const [loading, setLoading] = useState(true);  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');  
  const [polling, setPolling] = useState(false);  
  const [pollCount, setPollCount] = useState(0);  
  const [error, setError] = useState<string | null>(null);  
  
  // Poll payment status if poll_url is provided  
  useEffect(() => {  
    if (!pollUrl || !orderId || !isDemo) {  
      return;  
    }  
  
    setPolling(true);  
    setPollCount(0);  
  
    const pollPayment = async () => {  
      try {  
        const response = await fetch(`/api/payment-status?poll_url=${encodeURIComponent(pollUrl)}&order_id=${orderId}`);  
        const data = await response.json();  
  
        if (data.success) {  
          setPaymentStatus(data.paid ? 'paid' : 'pending');  
            
          if (data.paid) {  
            setPolling(false);  
            // Refresh order data to get updated status  
            fetchOrder();  
          }  
        } else {  
          setError(data.error || 'Failed to check payment status');  
        }  
      } catch (err) {  
        console.error('Polling error:', err);  
        setError('Failed to check payment status');  
      }  
    };  
  
    // Initial poll  
    pollPayment();  
  
    // Poll every 5 seconds, max 60 attempts (5 minutes)  
    const interval = setInterval(() => {  
      setPollCount((prev) => {  
        if (prev >= 60) {  
          setPolling(false);  
          clearInterval(interval);  
          return prev;  
        }  
        pollPayment();  
        return prev + 1;  
      });  
    }, 5000);  
  
    return () => clearInterval(interval);  
  }, [pollUrl, orderId, isDemo]);  
  
  const fetchOrder = async () => {  
    if (!orderId) {  
      setLoading(false);  
      return;  
    }  
  
    try {  
      const { data: orderData, error: orderError } = await supabase  
        .from('store_orders')  
        .select('*')  
        .eq('order_number', orderId)  
        .single();  
  
      if (orderError || !orderData) {  
        console.error('Error fetching order:', orderError);  
        setLoading(false);  
        return;  
      }  
  
      const { data: itemsData, error: itemsError } = await supabase  
        .from('store_order_items')  
        .select('*')  
        .eq('order_id', (orderData as any).id);  
  
      if (itemsError) {  
        console.error('Error fetching order items:', itemsError);  
      }  
  
      setOrder({  
        ...(orderData as any),  
        items: itemsData || [],  
      });  
        
      // Update payment status from database  
      if ((orderData as any).payment_status === 'paid') {  
        setPaymentStatus('paid');  
        setPolling(false);  
      }  
    } catch (error) {  
      console.error('Error:', error);  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  useEffect(() => {  
    fetchOrder();  
  }, [orderId]);  
  
  if (loading) {  
    return (  
      <div className="min-h-screen flex items-center justify-center">  
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>  
      </div>  
    );  
  }  
  
  if (!order) {  
    return (  
      <div className="min-h-screen flex items-center justify-center">  
        <div className="text-center">  
          <h1 className="text-3xl font-comic text-gray-900 mb-4">Order Not Found</h1>  
          <Link href="/shop" className="btn-primary">  
            Continue Shopping  
          </Link>  
        </div>  
      </div>  
    );  
  }  
  
  const getStatusMessage = () => {  
    if (error) return { text: error, color: 'text-red-600' };  
    if (paymentStatus === 'paid') return { text: 'Payment Confirmed!', color: 'text-green-600' };  
    if (paymentStatus === 'failed') return { text: 'Payment Failed', color: 'text-red-600' };  
    if (polling) return { text: 'Waiting for payment...', color: 'text-yellow-600' };  
    return { text: 'Payment Pending', color: 'text-yellow-600' };  
  };  
  
  const statusMessage = getStatusMessage();  
  
  return (  
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">  
      <div className="container mx-auto px-4">  
        <div className="max-w-3xl mx-auto">  
          {/* Success Icon */}  
          <div className="text-center mb-8">  
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${  
              paymentStatus === 'paid' ? 'bg-green-500' : 'bg-primary'  
            }`}>  
              {paymentStatus === 'paid' ? (  
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />  
                </svg>  
              ) : polling ? (  
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>  
              ) : (  
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />  
                </svg>  
              )}  
            </div>  
            <h1 className="text-4xl md:text-5xl font-comic text-gray-900 mb-4">  
              {paymentStatus === 'paid' ? 'Payment Successful!' : 'Order Received!'}  
            </h1>  
            <p className="text-xl text-gray-600">  
              Thank you for your order, {order.first_name}!  
            </p>  
            {isDemo && (  
              <p className={`text-lg font-semibold mt-2 ${statusMessage.color}`}>  
                {statusMessage.text}  
              </p>  
            )}  
          </div>  
  
          {/* Order Details Card */}  
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-6">  
            <div className="bg-primary text-white p-6">  
              <h2 className="text-2xl font-comic mb-2">Order Details</h2>  
              <p className="text-white/90">Order ID: <span className="font-mono font-bold">{order.order_number}</span></p>  
            </div>  
  
            <div className="p-8">  
              {/* Customer Info */}  
              <div className="mb-8">  
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>  
                <div className="space-y-2 text-gray-600">  
                  <p><strong>Name:</strong> {order.first_name} {order.last_name}</p>  
                  <p><strong>Phone:</strong> {order.phone}</p>  
                  <p><strong>Status:</strong> <span className="text-primary font-semibold capitalize">{order.status.replace('_', ' ')}</span></p>  
                  <p><strong>Payment Status:</strong> <span className={`font-semibold capitalize ${statusMessage.color}`}>{order.payment_status.replace('_', ' ')}</span></p>  
                </div>  
              </div>  
  
              {/* Order Items */}  
              <div className="mb-8">  
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>  
                <div className="space-y-3">  
                  {order.items.map((item, index) => (  
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200">  
                      <div>  
                        <p className="font-medium text-gray-900">{item.product_name}</p>  
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>  
                      </div>  
                      <p className="font-semibold text-gray-900">{formatPrice(item.line_total)}</p>  
                    </div>  
                  ))}  
                </div>  
              </div>  
  
              {/* Total */}  
              <div className="border-t-2 border-gray-300 pt-4">  
                <div className="flex justify-between items-center text-2xl font-bold">  
                  <span>Total</span>  
                  <span className="text-primary">{formatPrice(order.subtotal)}</span>  
                </div>  
              </div>  
            </div>  
          </div>  
  
          {/* Next Steps */}  
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 mb-6">  
            <h3 className="text-2xl font-comic text-gray-900 mb-4">What's Next?</h3>  
            <div className="space-y-4 text-gray-600">  
              {isDemo && paymentStatus !== 'paid' ? (  
                <>  
                  <p className="flex items-start gap-3">  
                    <span className="text-primary text-xl">📱</span>  
                    <span>Complete the payment via the EcoCash prompt sent to your phone.</span>  
                  </p>  
                  <p className="flex items-start gap-3">  
                    <span className="text-primary text-xl">⏳</span>  
                    <span>This page will automatically update when payment is confirmed.</span>  
                  </p>  
                  {polling && (  
                    <p className="flex items-start gap-3">  
                      <span className="text-primary text-xl">🔄</span>  
                      <span>Checking payment status... (attempt {pollCount + 1}/60)</span>  
                    </p>  
                  )}  
                </>  
              ) : (  
                <p className="flex items-start gap-3">  
                  <span className="text-primary text-xl">✅</span>  
                  <span>Your payment has been confirmed!</span>  
                </p>  
              )}  
              <p className="flex items-start gap-3">  
                <span className="text-primary text-xl">🌿</span>  
                <span>Visit us at {process.env.NEXT_PUBLIC_STORE_ADDRESS} to collect your flowers.</span>  
              </p>  
              <p className="flex items-start gap-3">  
                <span className="text-primary text-xl">📞</span>  
                <span>Questions? Call us at {process.env.NEXT_PUBLIC_STORE_PHONE}</span>  
              </p>  
            </div>  
          </div>  
  
          {/* Actions */}  
          <div className="flex flex-col sm:flex-row gap-4">  
            <Link href="/shop" className="btn-primary flex-1 text-center">  
              Continue Shopping  
            </Link>  
            <Link href="/" className="btn-secondary flex-1 text-center">  
              Back to Home  
            </Link>  
          </div>  
        </div>  
      </div>  
    </section>  
  );  
}  
  
export default function ConfirmationPage() {  
  return (  
    <Suspense fallback={  
      <div className="min-h-screen flex items-center justify-center">  
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>  
      </div>  
    }>  
      <ConfirmationContent />  
    </Suspense>  
  );  
}