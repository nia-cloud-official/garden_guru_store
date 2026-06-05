'use client';  
  
import { useState } from 'react';  
import { useRouter } from 'next/navigation';  
import Link from 'next/link';  
import { useCart } from '@/contexts/CartContext';  
import { formatPrice, validateZimbabwePhone, cleanPhone } from '@/lib/utils';  
import PaymentRedirectPopup from '@/components/PaymentRedirectPopup';  
import toast from 'react-hot-toast';  
  
export const dynamic = 'force-dynamic';  
  
export default function CheckoutPage() {  
  const router = useRouter();  
  const { cart, cartCount, cartSubtotal, clearCart } = useCart();  
  const [loading, setLoading] = useState(false);  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');  
  const [showBankModal, setShowBankModal] = useState(false);  
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);  
  const [paymentPopupUrl, setPaymentPopupUrl] = useState<string>('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [paymentError, setPaymentError] = useState<string>('');
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [currentPollUrl, setCurrentPollUrl] = useState<string>('');
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);  
  const [formData, setFormData] = useState({  
    firstName: '',  
    lastName: '',  
    email: '',  
    phone: '',  
  });  
  const [errors, setErrors] = useState<Record<string, string>>({});  
  
  const cartItems = Object.values(cart);  
  
  // Client-side only redirect  
  if (typeof window !== 'undefined' && cartItems.length === 0) {  
    router.push('/shop');  
    return null;  
  }  
  
  // Show loading state during SSR or when cart is empty  
  if (cartItems.length === 0) {  
    return (  
      <div className="min-h-screen flex items-center justify-center">  
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>  
      </div>  
    );  
  }  
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {  
    const { name, value } = e.target;  
    setFormData((prev) => ({ ...prev, [name]: value }));  
    if (errors[name]) {  
      setErrors((prev) => ({ ...prev, [name]: '' }));  
    }  
  };  
  
  const validate = () => {  
    const newErrors: Record<string, string> = {};  
  
    if (!formData.firstName.trim()) {  
      newErrors.firstName = 'First name is required';  
    }  
    if (!formData.lastName.trim()) {  
      newErrors.lastName = 'Last name is required';  
    }  
    if (!formData.email.trim()) {  
      newErrors.email = 'Email is required';  
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {  
      newErrors.email = 'Please enter a valid email address';  
    }  
  
    if (!formData.phone.trim()) {  
      newErrors.phone = 'Phone number is required';  
    } else if (!validateZimbabwePhone(formData.phone)) {  
      newErrors.phone = 'Please enter a valid Zimbabwe mobile number (e.g. 0771234567)';  
    }  
  
    setErrors(newErrors);  
    return Object.keys(newErrors).length === 0;  
  };  
  
  const handleSubmit = async (e: React.FormEvent) => {  
    e.preventDefault();  
  
    if (!validate()) {  
      return;  
    }  
  
    if (!selectedPaymentMethod) {  
      toast.error('Please select a payment method');  
      return;  
    }  
  
    if (selectedPaymentMethod === 'bank') {  
      setShowBankModal(true);  
      return;  
    }  
  
    setLoading(true);  
  
    try {  
      console.log('🛒 Starting checkout request...');  
      const checkoutPayload = {  
        firstName: formData.firstName.trim(),  
        lastName: formData.lastName.trim(),  
        email: formData.email.trim(),  
        phone: cleanPhone(formData.phone),  
        paymentMethod: selectedPaymentMethod,  
        cart: cartItems.map((item) => ({  
          product_id: item.product.id,  
          product_name: item.product.name,  
          product_price: item.product.price,  
          quantity: item.quantity,  
        })),  
        subtotal: cartSubtotal,  
      };  
      console.log('📦 Checkout payload:', checkoutPayload);  
  
      const startTime = Date.now();  
      const response = await fetch('/api/checkout', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify(checkoutPayload),  
      });  
      const duration = Date.now() - startTime;  
  
      console.log(`⏱️  Checkout request took ${duration}ms`);  
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);  
      console.log(`📋 Response headers:`, {  
        contentType: response.headers.get('content-type'),  
        contentLength: response.headers.get('content-length'),  
      });  
  
      let data;  
      try {  
        data = await response.json();  
        console.log('✅ Response parsed as JSON:', data);  
      } catch (parseErr) {  
        console.error('❌ Failed to parse response as JSON:', parseErr);  
        console.log('📝 Raw response text:', await response.text());  
        throw new Error('Server returned invalid JSON response');  
      }  
  
      if (!response.ok) {  
        console.error(`❌ Checkout failed with status ${response.status}:`, data);  
        throw new Error(data.error || `Checkout failed with status ${response.status}`);  
      }  
  
      console.log('✨ Checkout successful, got response:', data);  
  
      // Save customer email for account access
      localStorage.setItem('customer_email', formData.email.trim());

      // Clear cart first
      clearCart();

      // For Ecocash and Paynow, show redirect popup
      if (data.redirect_url) {
        console.log('🎯 Showing payment popup with redirect:', data.redirect_url);
        setCurrentOrderId(data.order_id);
        setCurrentPollUrl(data.poll_url || '');
        setPaymentPopupUrl(data.redirect_url);
        setShowPaymentPopup(true);
      } else {
        console.log('📍 Redirecting to confirmation page');
        router.push(`/confirmation?order_id=${data.order_id}`);
      }  
    } catch (error: any) {  
      console.error('💥 Checkout error caught:', {  
        message: error.message,  
        name: error.name,  
        stack: error.stack,  
        error: error,  
      });  
      toast.error(error.message || 'Something went wrong');  
      setLoading(false);  
    }  
  };  
  
  const handlePaymentPopupClose = async () => {
    setShowPaymentPopup(false);
    
    // Start polling payment status
    if (currentPollUrl && currentOrderId) {
      setPaymentStatus('pending');
      setShowPaymentStatusModal(true);
      
      let isPolling = true;
      
      // Poll payment status every 3 seconds
      const pollInterval = setInterval(async () => {
        if (!isPolling) return;
        
        try {
          const response = await fetch(`/api/payment-status?poll_url=${encodeURIComponent(currentPollUrl)}&order_id=${currentOrderId}`);
          const data = await response.json();
          
          if (data.success) {
            if (data.paid) {
              setPaymentStatus('paid');
              isPolling = false;
              clearInterval(pollInterval);
            } else if (data.status === 'failed') {
              setPaymentStatus('failed');
              setPaymentError(data.error || 'Payment failed. Please try again.');
              isPolling = false;
              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }
      }, 3000);
      
      // Stop polling after 5 minutes
      setTimeout(() => {
        if (isPolling) {
          isPolling = false;
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          setPaymentError('Payment timed out. Please check your order status or contact support.');
        }
      }, 300000);
    }
  };

  const handleBankTransferSubmit = async () => {  
    if (!proofOfPayment) {  
      toast.error('Please upload proof of payment');  
      return;  
    }  
  
    setLoading(true);  
  
    try {  
      const formDataToSend = new FormData();  
      formDataToSend.append('firstName', formData.firstName.trim());  
      formDataToSend.append('lastName', formData.lastName.trim());  
      formDataToSend.append('email', formData.email.trim());  
      formDataToSend.append('phone', cleanPhone(formData.phone));  
      formDataToSend.append('paymentMethod', 'bank');  
      formDataToSend.append('proofOfPayment', proofOfPayment);  
      formDataToSend.append('cart', JSON.stringify(cartItems.map((item) => ({  
        product_id: item.product.id,  
        product_name: item.product.name,  
        product_price: item.product.price,  
        quantity: item.quantity,  
      }))));  
      formDataToSend.append('subtotal', cartSubtotal.toString());  
  
      const response = await fetch('/api/checkout/bank-transfer', {  
        method: 'POST',  
        body: formDataToSend,  
      });  
  
      const data = await response.json();  
  
      if (!response.ok) {  
        throw new Error(data.error || 'Checkout failed');  
      }  
  
      // Save customer email for account access
      localStorage.setItem('customer_email', formData.email.trim());

      clearCart();
      setShowBankModal(false);
        
      // Show success confirmation modal
      setShowConfirmationModal(true);  
    } catch (error: any) {  
      toast.error(error.message || 'Something went wrong');  
      setLoading(false);  
    }  
  };  
  
  return (  
    <>  
      {/* Page Header */}  
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-24 mt-0">  
        <div className="container mx-auto px-4">  
          <div className="text-center">  
            <h1 className="text-5xl md:text-6xl font-comic text-gray-900 mb-4">Checkout</h1>  
            <nav className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-glass px-6 py-2 rounded-full mt-4 border border-gray-200">  
              <Link href="/" className="text-gray-600 hover:text-primary text-sm">  
                Home  
              </Link>  
              <span className="text-gray-400">/</span>  
              <Link href="/cart" className="text-gray-600 hover:text-primary text-sm">  
                Cart  
              </Link>  
              <span className="text-gray-400">/</span>  
              <span className="text-primary font-medium text-sm">Checkout</span>  
            </nav>  
          </div>  
        </div>  
      </section>  
  
      {/* Checkout Content */}  
      <section className="py-16 bg-white">  
        <div className="container mx-auto px-4">  
          <div className="max-w-6xl mx-auto">  
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">  
              {/* Checkout Form */}  
              <div className="lg:col-span-2">  
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">  
                  <h3 className="text-3xl font-comic text-gray-900 mb-2">Your Details</h3>  
                  <p className="text-gray-600 mb-8">  
                    No account needed. Quick checkout in 2 steps — just your contact info and payment preference. No hidden fees or extra forms.  
                  </p>  
  
                  <form onSubmit={handleSubmit} className="space-y-6">  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
                      <div>  
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">  
                          First Name *  
                        </label>  
                        <input  
                          type="text"  
                          id="firstName"  
                          name="firstName"  
                          value={formData.firstName}  
                          onChange={handleChange}  
                          className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}  
                          placeholder="John"  
                        />  
                        {errors.firstName && (  
                          <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>  
                        )}  
                      </div>  
  
                      <div>  
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">  
                          Last Name *  
                        </label>  
                        <input  
                          type="text"  
                          id="lastName"  
                          name="lastName"  
                          value={formData.lastName}  
                          onChange={handleChange}  
                          className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}  
                          placeholder="Doe"  
                        />  
                        {errors.lastName && (  
                          <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>  
                        )}  
                      </div>  
                    </div>  
  
                    <div>  
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">  
                        Email Address *  
                      </label>  
                      <input  
                        type="email"  
                        id="email"  
                        name="email"  
                        value={formData.email}  
                        onChange={handleChange}  
                        className={`input-field ${errors.email ? 'border-red-500' : ''}`}  
                        placeholder="john@example.com"  
                      />  
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}  
                    </div>  
  
                    <div>  
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">  
                        Mobile Number *  
                      </label>  
                      <input  
                        type="tel"  
                        id="phone"  
                        name="phone"  
                        value={formData.phone}  
                        onChange={handleChange}  
                        className={`input-field ${errors.phone ? 'border-red-500' : ''}`}  
                        placeholder="0771234567"  
                      />  
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}  
                      <p className="mt-2 text-sm text-gray-500">  
                        For payment confirmation and order updates.  
                      </p>  
                    </div>  
  
                    {/* Payment Methods */}  
                    <div className="pt-6">  
                      <label className="block text-sm font-medium text-gray-700 mb-4">  
                        Select Payment Method *  
                      </label>  
                      <div className="grid grid-cols-2 gap-4">  
                        {/* EcoCash - Mobile Payment */}  
                        <button  
                          type="button"  
                          onClick={() => setSelectedPaymentMethod('ecocash')}  
                          className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${  
                            selectedPaymentMethod === 'ecocash'  
                              ? 'border-[#00b050] bg-[#00b050]/5'  
                              : 'border-gray-200 hover:border-[#00b050]/50'  
                          }`}  
                        >  
                          <div className="flex flex-col items-center gap-3">  
                            <img   
                              src="https://ecocash.co.zw/storage/2025/07/EcoCash_logo.png"   
                              alt="EcoCash"  
                              className="w-20 h-20 object-contain"  
                            />  
                            <div className="text-center">  
                              <span className="text-base font-semibold text-gray-900 block">EcoCash</span>  
                              <span className="text-xs text-gray-500">Fast & secure mobile payment</span>  
                            </div>  
                          </div>  
                        </button>  
  
                        {/* Bank Transfer */}  
                        <button  
                          type="button"  
                          onClick={() => setSelectedPaymentMethod('bank')}  
                          className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${  
                            selectedPaymentMethod === 'bank'  
                              ? 'border-[#00b050] bg-[#00b050]/5'  
                              : 'border-gray-200 hover:border-[#00b050]/50'  
                          }`}  
                        >  
                          <div className="flex flex-col items-center gap-3">  
                            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-md">  
                              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />  
                              </svg>  
                            </div>  
                            <div className="text-center">  
                              <span className="text-base font-semibold text-gray-900 block">Bank Transfer</span>  
                              <span className="text-xs text-gray-500">Upload proof of payment</span>  
                            </div>  
                          </div>  
                        </button>  
                      </div>  
                    </div>  
  
                    <div className="pt-6">  
                      <button  
                        type="submit"  
                        disabled={loading || !selectedPaymentMethod}  
                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"  
                      >  
                        {loading ? (  
                          <>  
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>  
                            Processing...  
                          </>  
                        ) : (  
                          <>  
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />  
                            </svg>  
                            {selectedPaymentMethod === 'bank'   
                              ? 'View Bank Details'   
                              : selectedPaymentMethod === 'ecocash'  
                              ? 'Proceed to Payment'  
                              : 'Proceed to Payment'}  
                          </>  
                        )}  
                      </button>  
                    </div>  
                  </form>  
                </div>  
              </div>  
  
              {/* Order Summary */}  
              <div className="lg:col-span-1">  
                <div className="bg-gray-50 rounded-3xl shadow-lg border border-gray-200 p-8 sticky top-24">  
                  <h3 className="text-2xl font-comic text-gray-900 mb-6">Your Order</h3>  
  
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">  
                    {cartItems.map(({ product, quantity }) => (  
                      <div key={product.id} className="flex justify-between text-sm">  
                        <span className="text-gray-700">  
                          {product.name} <span className="text-gray-500">x {quantity}</span>  
                        </span>  
                        <span className="font-semibold text-gray-900">  
                          {formatPrice(product.price * quantity)}  
                        </span>  
                      </div>  
                    ))}  
                  </div>  
  
                  <div className="border-t border-gray-300 pt-4 space-y-3">  
                    <div className="flex justify-between text-gray-600">  
                      <span>Subtotal</span>  
                      <span>{formatPrice(cartSubtotal)}</span>  
                    </div>  
                    <div className="flex justify-between text-xl font-bold">  
                      <span>Total</span>  
                      <span className="text-primary">{formatPrice(cartSubtotal)}</span>  
                    </div>  
                  </div>  
  
                  <div className="mt-6">  
                    <Link href="/cart" className="btn-secondary w-full text-center block">  
                      ← Back to Cart  
                    </Link>  
                  </div>  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
      </section>  
  
      {/* Payment Redirect Popup */}
      <PaymentRedirectPopup
        isOpen={showPaymentPopup}
        redirectUrl={paymentPopupUrl}
        paymentMethod={selectedPaymentMethod as 'ecocash' | 'paynow'}
        onClose={handlePaymentPopupClose}
      />

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Received!</h3>
            <p className="text-gray-600 mb-6">
              Your proof of payment has been submitted successfully. We will call you to confirm your order within 24 hours.
            </p>
            <button
              onClick={() => {
                setShowConfirmationModal(false);
                router.push('/shop');
              }}
              className="w-full bg-[#00b050] hover:bg-[#009040] text-white py-4 rounded-full font-semibold transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      {showPaymentStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            {paymentStatus === 'pending' ? (
              <>
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Pending</h3>
                <p className="text-gray-600 mb-6">
                  Please check your phone for the payment prompt and complete the payment. This window will update automatically once payment is confirmed.
                </p>
                <p className="text-sm text-gray-500 mb-4">Order ID: {currentOrderId}</p>
              </>
            ) : paymentStatus === 'paid' ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">
                  Your payment has been received and confirmed. Thank you for your order!
                </p>
                <button
                  onClick={() => {
                    setShowPaymentStatusModal(false);
                    router.push(`/confirmation?order_id=${currentOrderId}`);
                  }}
                  className="w-full bg-[#00b050] hover:bg-[#009040] text-white py-4 rounded-full font-semibold transition-all"
                >
                  View Order Details
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h3>
                <p className="text-gray-600 mb-4">
                  {paymentError || 'Your payment could not be processed. Please try again.'}
                </p>
                <p className="text-sm text-gray-500 mb-6">Order ID: {currentOrderId}</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPaymentStatusModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentStatusModal(false);
                      router.push('/shop');
                    }}
                    className="flex-1 btn-primary"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bank Transfer Modal */}  
      {showBankModal && (  
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">  
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">  
              <div className="flex items-center justify-between mb-6">  
                <h3 className="text-3xl font-comic text-gray-900">Bank Transfer Details</h3>  
                <button  
                  onClick={() => setShowBankModal(false)}  
                  className="text-gray-400 hover:text-gray-600 transition-colors"  
                >  
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />  
                  </svg>  
                </button>  
              </div>  
  
              <div className="bg-gradient-to-br from-[#00b050]/10 to-[#00b050]/5 rounded-2xl p-6 mb-6">  
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">  
                  <svg className="w-5 h-5 text-[#00b050]" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />  
                  </svg>  
                  Bank Account Information  
                </h4>  
                <div className="space-y-3 text-sm">  
                  <div className="flex justify-between">  
                    <span className="text-gray-600">Bank Name:</span>  
                    <span className="font-semibold text-gray-900">Banc ABC</span>  
                  </div>  
                  <div className="flex justify-between">  
                    <span className="text-gray-600">Branch:</span>  
                    <span className="font-semibold text-gray-900">Jason Moyo Street</span>  
                  </div>  
                  <div className="flex justify-between">  
                    <span className="text-gray-600">Account Name:</span>  
                    <span className="font-semibold text-gray-900">Jessie Matthews Hardware t/a The Garden Guru</span>  
                  </div>  
                  <div className="flex justify-between">  
                    <span className="text-gray-600">RTGS Account:</span>  
                    <span className="font-semibold text-gray-900 font-mono">60503315511012</span>  
                  </div>  
                  <div className="flex justify-between">  
                    <span className="text-gray-600">Nostro Account:</span>  
                    <span className="font-semibold text-gray-900 font-mono">60503316602022</span>  
                  </div>  
                  <div className="flex justify-between pt-3 border-t border-[#00b050]/20">  
                    <span className="text-gray-600">Amount to Pay:</span>  
                    <span className="font-bold text-[#00b050] text-lg">{formatPrice(cartSubtotal)}</span>  
                  </div>  
                </div>  
              </div>  
  
              <div className="mb-6">  
                <label className="block text-sm font-medium text-gray-700 mb-2">  
                  Upload Proof of Payment *  
                </label>  
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#00b050] transition-colors">  
                  <input  
                    type="file"  
                    accept="image/*,.pdf"  
                    onChange={(e) => setProofOfPayment(e.target.files?.[0] || null)}  
                    className="hidden"  
                    id="proof-upload"  
                  />  
                  <label htmlFor="proof-upload" className="cursor-pointer">  
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />  
                    </svg>  
                    <p className="text-sm text-gray-600 mb-1">  
                      {proofOfPayment ? proofOfPayment.name : 'Click to upload or drag and drop'}  
                    </p>  
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>  
                  </label>  
                </div>  
              </div>  
  
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">  
                <div className="flex gap-3">  
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">  
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />  
                  </svg>  
                  <div className="text-sm text-blue-800">  
                    <p className="font-semibold mb-1">Important:</p>  
                    <p>After making the bank transfer, please upload your proof of payment. We'll verify and confirm your order within 24 hours.</p>  
                  </div>  
                </div>  
              </div>  
  
              <div className="flex gap-4">  
                <button  
                  onClick={() => setShowBankModal(false)}  
                  className="flex-1 btn-secondary"  
                >  
                  Cancel  
                </button>  
                <button  
                  onClick={handleBankTransferSubmit}  
                  disabled={loading || !proofOfPayment}  
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"  
                >  
                  {loading ? 'Submitting...' : 'Submit Payment'}  
                </button>  
              </div>  
            </div>  
          </div>  
        </div>  
      )}  
    </>  
  );  
}