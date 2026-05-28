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
  paymentMethod: PaynowPaymentMethod
): Promise<PaynowInitiateResult> {
  const config = getPaynowConfig();
  if (!config) {
    return { success: false, error: 'Paynow is not configured. Set PAYNOW_INTEGRATION_ID, PAYNOW_INTEGRATION_KEY, NEXT_PUBLIC_PAYNOW_RETURN_URL, and PAYNOW_RESULT_URL.' };
  }

  const fields = buildPaynowFields(orderId, customerName, customerEmail, phone, amount, cartItems, paymentMethod, config);
  fields.hash = signPaynowFields(fields, config.integrationKey);

  const body = new URLSearchParams(fields).toString();

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const text = await response.text();
    const result = parsePaynowResponse(text);

    if (result.status?.toLowerCase() === 'ok') {
      return {
        success: true,
        redirectUrl: result.browserurl || undefined,
        pollUrl: result.pollurl || undefined,
        transactionId: result.transaction || result.reference || undefined,
      };
    }

    return { success: false, error: result.error || result.status || 'Unknown Paynow response' };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Network error while contacting Paynow' };
  }
}
