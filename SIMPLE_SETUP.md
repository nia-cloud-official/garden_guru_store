# Simple Bank Transfer Setup (5 Minutes)

## 1. Install nodemailer
```bash
cd /home/earlvaltor/Desktop/garden_guru/store
npm install nodemailer
```

## 2. Get Gmail App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Create new app password for "Mail"
5. Copy the 16-character password

## 3. Update .env.local
Replace `your_gmail_app_password_here` with your actual app password:
```env
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

## 4. Run Database Migration
In Supabase SQL Editor, run:
```sql
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;
```

## 5. Create Supabase Storage Bucket
1. Supabase Dashboard → Storage
2. Create bucket: `store-assets` (make it PUBLIC)
3. Done!

## That's It!

When customers select "Bank Transfer":
- They upload proof of payment
- Email sent to tggsalesadministration@gmail.com with:
  - Customer details (name, email, phone)
  - Order items and total
  - Link to view proof of payment
- Customer redirected to store with success message
- You call them to confirm

No DNS setup, no domain verification, just works!
