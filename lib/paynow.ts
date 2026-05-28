import * as crypto from 'crypto';
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

export function buildPaynowFields(
  orderId: string,
  customerName: string,
  customerEmail: string,
  phone: string,
  amount: number,
  cartItems: { product_name: string; quantity: number }[],
  paymentMethod: PaynowPaymentMethod,
  config: PaynowConfig
): Record<string, string> {
  const normalizedPhone = cleanPhone(phone);
  const itemList = cartItems.map((item) => `${item.product_name} x${item.quantity}`);
  const additionalInfo = [customerName, ...itemList].join(' | ');
  const method = paymentMethod === 'ecocash' ? 'ecocash' : 'paynow';

  return {
    id: config.integrationId,
    reference: orderId,
    amount: amount.toFixed(2),
    additionalinfo: additionalInfo,
    returnurl: `${config.returnUrl}?order_id=${encodeURIComponent(orderId)}`,
    resulturl: config.resultUrl,
    authemail: customerEmail,
    phone: normalizedPhone,
    method,
    status: 'Message',
  };
}

export function signPaynowFields(fields: Record<string, string>, integrationKey: string): string {
  const hashInput = [
    fields.id,
    fields.reference,
    fields.amount,
    fields.additionalinfo,
    fields.returnurl,
    fields.resulturl,
    fields.authemail,
    fields.phone,
    fields.method,
    fields.status,
  ].join('') + integrationKey;

  return crypto.createHash('sha512').update(hashInput).digest('hex').toUpperCase();
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
  cartItems: { product_name: string; quantity: number }[],
  paymentMethod: PaynowPaymentMethod,
  requestId?: string
): Promise<PaynowInitiateResult> {
  const logId = requestId || `paynow-${Date.now()}`;
  const config = getPaynowConfig();
  
  if (!config) {
    console.error(`[${logId}] Paynow configuration missing`);
    return { success: false, error: 'Paynow is not configured. Set PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, NEXT_PUBLIC_PAYNOW_RETURN_URL, and PAYNOW_RESULT_URL.' };
  }

  console.log(`[${logId}] Building Paynow request fields`, {
    orderId,
    customerName,
    customerEmail,
    phone,
    amount,
    cartItemsCount: cartItems.length,
    paymentMethod,
    endpoint: config.endpoint,
  });

  const fields = buildPaynowFields(orderId, customerName, customerEmail, phone, amount, cartItems, paymentMethod, config);
  fields.hash = signPaynowFields(fields, config.integrationKey);

  const body = new URLSearchParams(fields).toString();
  
  console.log(`[${logId}] Sending request to Paynow`, {
    endpoint: config.endpoint,
    bodyLength: body.length,
    fieldsKeys: Object.keys(fields),
  });

  try {
    const requestStartTime = Date.now();
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const requestDuration = Date.now() - requestStartTime;

    console.log(`[${logId}] Paynow response received (${requestDuration}ms)`, {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
    });

    const text = await response.text();
    
    console.log(`[${logId}] Paynow response body (${text.length} bytes):`, {
      rawResponse: text,
      truncated: text.length > 500 ? text.substring(0, 500) + '...' : text,
    });
    
    const result = parsePaynowResponse(text);
    
    console.log(`[${logId}] Parsed Paynow response`, {
      status: result.status,
      hasError: !!result.error,
      hasRedirect: !!result.browserurl,
      hasPollUrl: !!result.pollurl,
      hasTransaction: !!result.transaction,
      parsedKeys: Object.keys(result),
    });

    if (result.status?.toLowerCase() === 'ok') {
      const successResult = {
        success: true,
        redirectUrl: result.browserurl || undefined,
        pollUrl: result.pollurl || undefined,
        transactionId: result.transaction || result.reference || undefined,
      };
      
      console.log(`[${logId}] Paynow request successful`, {
        transactionId: successResult.transactionId,
        hasRedirectUrl: !!successResult.redirectUrl,
      });
      
      return successResult;
    }

    const errorMessage = result.error || result.status || 'Unknown Paynow response';
    console.error(`[${logId}] Paynow request failed`, {
      error: errorMessage,
      status: result.status,
      fullResponse: result,
    });
    
    return { success: false, error: errorMessage };
  } catch (error: any) {
    console.error(`[${logId}] Network error contacting Paynow`, {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
    });
    return { success: false, error: error?.message || 'Network error while contacting Paynow' };
  }
}
