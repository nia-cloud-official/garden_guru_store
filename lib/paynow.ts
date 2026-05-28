import { cleanPhone } from './utils';

export type PaynowPaymentMethod = 'ecocash' | 'paynow';

export interface PaynowInitiateResult {
  success: boolean;
  redirectUrl?: string;
  pollUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface PaynowConfig {
  integrationId: string;
  integrationKey: string;
  returnUrl: string;
  resultUrl: string;
  endpoint: string;
}

export function getPaynowConfig(): PaynowConfig | null {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID?.trim() || '';
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY?.trim() || '';
  const returnUrl = process.env.NEXT_PUBLIC_PAYNOW_RETURN_URL?.trim() || '';
  const resultUrl = process.env.PAYNOW_RESULT_URL?.trim() || '';
  const endpoint = process.env.PAYNOW_ENDPOINT?.trim() || 'https://www.paynow.co.zw/interface/remotetransaction';

  if (
    !integrationId ||
    integrationId === 'YOUR_INTEGRATION_ID' ||
    !integrationKey ||
    integrationKey === 'YOUR_INTEGRATION_KEY' ||
    !returnUrl ||
    !resultUrl
  ) {
    return null;
  }

  return { integrationId, integrationKey, returnUrl, resultUrl, endpoint };
}

export function isPaynowConfigured(): boolean {
  return getPaynowConfig() !== null;
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
  const config = getPaynowConfig();

  if (!config) {
    console.error(`[${logId}] Paynow configuration missing`);
    return {
      success: false,
      error:
        'Paynow is not configured. Set PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, NEXT_PUBLIC_PAYNOW_RETURN_URL, and PAYNOW_RESULT_URL.',
    };
  }

  try {
    console.log(`[${logId}] Loading Paynow SDK`);
    const paynowModule = await import('paynow');
    const Paynow = paynowModule.Paynow || paynowModule.default?.Paynow || paynowModule.default;

    if (!Paynow) {
      throw new Error('Paynow SDK did not export Paynow class');
    }

    const paynow = new Paynow(config.integrationId, config.integrationKey);
    paynow.resultUrl = config.resultUrl;
    paynow.returnUrl = `${config.returnUrl}?order_id=${encodeURIComponent(orderId)}`;

    console.log(`[${logId}] Creating Paynow payment object`, {
      orderId,
      customerEmail,
      paymentMethod,
      amount,
      cartItemsCount: cartItems.length,
    });

    const payment = paymentMethod === 'ecocash'
      ? paynow.createPayment(orderId, customerEmail)
      : paynow.createPayment(orderId);

    cartItems.forEach((item) => {
      payment.add(item.product_name, item.product_price);
    });

    const normalizedPhone = cleanPhone(phone);
    const startTime = Date.now();
    let response: any;

    if (paymentMethod === 'paynow') {
      console.log(`[${logId}] Sending Paynow web payment`);
      response = await paynow.send(payment);
    } else {
      console.log(`[${logId}] Sending Paynow mobile payment`, {
        phone: normalizedPhone,
        method: 'ecocash',
      });
      response = await paynow.sendMobile(payment, normalizedPhone, 'ecocash');
    }

    const duration = Date.now() - startTime;
    console.log(`[${logId}] Paynow SDK response (${duration}ms)`, {
      success: response?.success,
      error: response?.error,
      redirectUrl: response?.redirectUrl,
      pollUrl: response?.pollUrl,
      transaction: response?.transaction,
      reference: response?.reference,
      instructions: response?.instructions,
    });

    if (!response?.success) {
      const errorMessage = response?.error || 'Paynow checkout failed';
      console.error(`[${logId}] Paynow initiation failed`, { errorMessage, response });
      return { success: false, error: errorMessage };
    }

    return {
      success: true,
      redirectUrl: response?.redirectUrl || undefined,
      pollUrl: response?.pollUrl || undefined,
      transactionId: response?.transaction || response?.reference || undefined,
    };
  } catch (error: any) {
    console.error(`[${logId}] Paynow integration error`, {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return { success: false, error: error?.message || 'Network error while contacting Paynow' };
  }
}
