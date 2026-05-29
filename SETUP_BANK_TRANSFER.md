# Bank Transfer Setup Guide

## 1. Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add proof_of_payment_url column to store_orders table
ALTER TABLE store_orders 
ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN store_orders.proof_of_payment_url IS 'URL to the uploaded proof of payment document (for bank transfer orders)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_store_orders_proof_of_payment 
ON store_orders(proof_of_payment_url) 
WHERE proof_of_payment_url IS NOT NULL;
```

## 2. Create Supabase Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket called `store-assets`
3. Make it **public** (so proof of payment URLs are accessible)
4. Create a folder inside called `proof-of-payments`

## 3. Install Resend Package

```bash
cd /home/earlvaltor/Desktop/garden_guru/store
npm install resend
```

## 4. Get Resend API Key

1. Go to https://resend.com and sign up (free tier: 100 emails/day)
2. Verify your domain OR use their test domain for development
3. Get your API key from the dashboard

## 5. Update Environment Variables

Add these to `/home/earlvaltor/Desktop/garden_guru/store/.env.local`:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@gardenguru.co.zw
```

## 6. Test the Flow

1. Go to the store checkout page
2. Select "Bank Transfer" as payment method
3. Fill in customer details
4. Upload a proof of payment (image or PDF)
5. Submit the order

**Expected Results:**
- Order created in database with `proof_of_payment_url`
- File uploaded to Supabase Storage
- Email sent to `salesadministrator@gmail.com` with order details and proof of payment link
- Confirmation email sent to customer

## 7. Verify Emails

Check that emails are being sent to:
- **Admin:** salesadministrator@gmail.com (with proof of payment link)
- **Customer:** Their provided email (order confirmation)

## Notes

- Maximum file size: 10MB
- Allowed file types: JPG, PNG, GIF, PDF
- Emails are sent asynchronously - order creation won't fail if email fails
- All logs are prefixed with request ID for debugging
