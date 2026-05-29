import { Paynow } from 'paynow';
import { cleanPhone } from './utils';

export type PaynowPaymentMethod = 'ecocash' | 'paynow';

export interface PaynowInitiateResult {
  success: boolean;
  redirectUrl?: string;
  pollUrl?: string;
  transactionId?: string;
  error?: string;
}

// Singleton instance
let paynowInstance: Paynow | null = null;

export function getPaynow() {
  if (paynowInstance) return paynowInstance;

  const PAYNOW_ID = process.env.PAYNOW_INTEGRATION_ID || '';
  const PAYNOW_KEY = process.env.PAYNOW_INTEGRATION_KEY || '';

  if (!process.env.PAYNOW_INTEGRATION_ID && process.env.NODE_ENV !== 'production') {
    console.warn('PAYNOW_INTEGRATION_ID is missing. Payments will fail if not using a mock.');
  }

  paynowInstance = new Paynow(PAYNOW_ID, PAYNOW_KEY);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  paynowInstance.resultUrl = process.env.PAYNOW_RESULT_URL || `${APP_URL}/api/paynow/result`;
  paynowInstance.returnUrl = process.env.NEXT_PUBLIC_PAYNOW_RETURN_URL || `${APP_URL}/checkout/confirmation`;

  return paynowInstance;
}

export async function createPaynowPayment(
  reference: string,
  authEmail: string,
  amount: number,
  returnUrlOverride?: string
) {
  console.log('Paynow ID Present:', !!process.env.PAYNOW_INTEGRATION_ID);
  console.log('Paynow Key Present:', !!process.env.PAYNOW_INTEGRATION_KEY);

  const paynow = getPaynow();
  const payment = paynow.createPayment(reference, authEmail);
  payment.add('Order', amount);

  if (returnUrlOverride) {
    paynow.returnUrl = returnUrlOverride;
  }

  console.log('Initiating Paynow payment for:', reference, 'Amount:', amount);

  try {
    const response = await paynow.send(payment);
    console.log('Paynow Response:', response);
    return response;
  } catch (error) {
    console.error('Paynow Error Details:', error);
    throw error;
  }
}

export async function checkPaymentStatus(pollUrl: string) {
  try {
    const paynow = getPaynow();
    const status = await paynow.pollTransaction(pollUrl);
    return status;
  } catch (error) {
    console.error('Paynow Poll Error:', error);
    throw error;
  }

}

export function parsePaynowResponse(responseText: string): Record<string, string> {
  const result: Record<string, string> = {};
  responseText.split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key) {
      result[key] = decodeURIComponent(value || '');
    }
  });
  return result;
}

export function isPaynowConfigured(): boolean {
  return !!process.env.PAYNOW_INTEGRATION_ID && !!process.env.PAYNOW_INTEGRATION_KEY && !!(process.env.NEXT_PUBLIC_PAYNOW_RETURN_URL || process.env.PAYNOW_RESULT_URL);
}

export async function initiatePaynow(
  orderId: string,
  customerName: string,
  customerEmail: string,
  phone: string,
  amount: number,
  cartItems: { product_name: string; quantity: number; product_price: number }[],
  paymentMethod: PaynowPaymentMethod,
  requestId?: string
): Promise<PaynowInitiateResult> {
  const logId = requestId || `paynow-${Date.now()}`;

  if (!isPaynowConfigured()) {
    console.error(`[${logId}] Paynow configuration missing`);
    return { success: false, error: 'Paynow is not configured.' };
  }

  try {
    const paynow = getPaynow();
    // Create payment; include customer email if available
    const payment = paymentMethod === 'ecocash' ? paynow.createPayment(orderId, customerEmail) : paynow.createPayment(orderId, customerEmail);

    cartItems.forEach((item) => {
      // Add each item's unit price (Paynow expects label + amount)
      payment.add(item.product_name, item.product_price);
    });

    const normalizedPhone = cleanPhone(phone || '');
    let response: any;
    const mobileService = paymentMethod === 'ecocash' ? 'ecocash' : 'paynow';

    console.log(`[${logId}] Sending Paynow mobile payment via ${mobileService}`);
    response = await paynow.sendMobile(payment, normalizedPhone, mobileService);

    console.log(`[${logId}] Paynow response:`, response);

    if (!response?.success) {
      return { success: false, error: response?.error || 'Paynow initiation failed' };
    }

    return {
      success: true,
      redirectUrl: response?.redirectUrl || undefined,
      pollUrl: response?.pollUrl || undefined,
      transactionId: response?.transaction || response?.reference || undefined,
    };
  } catch (err: any) {
    console.error(`[${logId}] initiatePaynow error:`, err);
    return { success: false, error: err?.message || 'Paynow error' };
  }
}
