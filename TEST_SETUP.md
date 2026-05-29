# Test Your Setup

## 1. Check Database Column Exists

Run this in Supabase SQL Editor:

```sql
-- Add the column if it doesn't exist
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;

-- Verify it exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'store_orders' AND column_name = 'proof_of_payment_url';
```

Should return: `proof_of_payment_url | text`

## 2. Check Supabase Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Look for bucket named `store-assets`
3. If it doesn't exist, create it and make it PUBLIC
4. Create folder inside: `proof-of-payments`

## 3. Test Bank Transfer (No Email Needed)

1. Go to checkout
2. Select "Bank Transfer"
3. Upload any image
4. Submit

**Expected:**
- Order created in database
- File uploaded to Supabase
- Success message shown
- Redirected to shop

**Check logs in Vercel:**
- Should see: `[bank-XXXXX] Complete - Order: TGG-XXXXX`
- Should see: `Customer: Name, email, phone`
- Should see: `Proof of payment: https://...`

## 4. Test Paynow/EcoCash

The Paynow integration needs valid credentials. Check your `.env.local`:

```env
PAYNOW_INTEGRATION_ID=24906
PAYNOW_INTEGRATION_KEY=ff21ed17-4b20-410e-8365-0d3310bc790b
```

If these are test credentials, Paynow will reject them in production.

**To test:**
1. Go to checkout
2. Select "Paynow" or "EcoCash"
3. Submit

**Check Vercel logs for:**
- `[checkout-XXXXX] Paynow result: {...}`
- If it says `success: false`, check the error message
- Common errors:
  - "Invalid integration" = wrong credentials
  - "Method not recognized" = fixed in code
  - Network errors = Paynow API down

## Quick Fix if Paynow Fails

If Paynow keeps failing, just disable it temporarily:

In `/store/app/checkout/page.tsx`, comment out the Paynow/EcoCash buttons and only show Bank Transfer.

Bank Transfer works 100% without any external dependencies!
