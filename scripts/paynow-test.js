const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  return fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) return acc;
      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim();
      acc[key] = value.replace(/^"|"$/g, '');
      return acc;
    }, {});
}

function getEnvValue(key, env) {
  return process.env[key] || env[key] || '';
}

function buildFields({ integrationId, returnUrl, resultUrl, orderId, email, phone, amount, cartItems, paymentMethod }) {
  const normalizedPhone = phone.replace(/\s+/g, '');
  const additionalInfo = cartItems.map((item) => `${item.product_name} x${item.quantity}`).join(', ');
  const method = paymentMethod === 'ecocash' ? 'ecocash' : 'paynow';

  return {
    id: integrationId,
    reference: orderId,
    amount: amount.toFixed(2),
    additionalinfo: additionalInfo,
    returnurl: `${returnUrl}?order_id=${encodeURIComponent(orderId)}`,
    resulturl: resultUrl,
    authemail: email,
    phone: normalizedPhone,
    method,
    status: 'Message',
  };
}

function signFields(fields, integrationKey) {
  const hashString = [
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
  return crypto.createHash('sha512').update(hashString).digest('hex').toUpperCase();
}

function parseResponse(text) {
  return text
    .split('&')
    .filter(Boolean)
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      acc[key] = value ? decodeURIComponent(value) : '';
      return acc;
    }, {});
}

async function runTest() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = loadDotEnv(envPath);

  const integrationId = getEnvValue('PAYNOW_INTEGRATION_ID', env);
  const integrationKey = getEnvValue('PAYNOW_INTEGRATION_KEY', env);
  const returnUrl = getEnvValue('NEXT_PUBLIC_PAYNOW_RETURN_URL', env);
  const resultUrl = getEnvValue('PAYNOW_RESULT_URL', env);
  const endpoint = getEnvValue('PAYNOW_ENDPOINT', env) || 'https://www.paynow.co.zw/interface/remotetransaction';

  if (!integrationId || integrationId === 'YOUR_INTEGRATION_ID' || !integrationKey || integrationKey === 'YOUR_INTEGRATION_KEY') {
    console.error('Paynow credentials are missing in .env.local or environment variables.');
    process.exit(1);
  }

  if (!returnUrl || !resultUrl) {
    console.error('Paynow return/result URLs are missing in .env.local or environment variables.');
    process.exit(1);
  }

  const paymentMethod = process.argv[2] === 'paynow' ? 'paynow' : 'ecocash';
  const orderId = `TEST-${Date.now()}`;
  const amount = 1.0;
  const cartItems = [{ product_name: 'Paynow Test Item', quantity: 1 }];

  const fields = buildFields({
    integrationId,
    returnUrl,
    resultUrl,
    orderId,
    email: 'test@example.com',
    phone: '0771234567',
    amount,
    cartItems,
    paymentMethod,
  });

  fields.hash = signFields(fields, integrationKey);

  console.log('Paynow Test Request:');
  console.log(JSON.stringify(fields, null, 2));
  console.log('Endpoint:', endpoint);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });

  const responseText = await response.text();
  console.log('\nPaynow Response:');
  console.log(responseText);
  console.log('\nParsed Result:');
  console.log(parseResponse(responseText));
}

runTest().catch((error) => {
  console.error('Test script failed:', error);
  process.exit(1);
});
