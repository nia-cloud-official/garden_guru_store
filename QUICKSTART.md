# Quick Start Guide

Get the Garden Guru store running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)

## Step 1: Install Dependencies (1 min)

```bash
cd store-nextjs
npm install
```

## Step 2: Set Up Supabase (2 min)

1. Go to https://supabase.com and create a new project
2. Wait for the project to be ready (~2 minutes)
3. Go to **Project Settings** > **API**
4. Copy your **Project URL** and **anon public** key

## Step 3: Create Database Tables (1 min)

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and click **Run**

## Step 4: Configure Environment (30 sec)

Create a `.env.local` file:

```bash
cp .env.local .env.local.backup
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Run the App (30 sec)

```bash
npm run dev
```

Open http://localhost:3001 in your browser!

## What You'll See

- ✅ Homepage with featured products
- ✅ Shop page with all products
- ✅ Product detail pages
- ✅ Shopping cart
- ✅ Checkout flow

## Next Steps

### Add Your Own Products

1. Go to your Supabase dashboard
2. Click **Table Editor** > **products**
3. Click **Insert** > **Insert row**
4. Add your product details
5. Refresh your store to see the new product

### Add Product Images

1. Place images in `public/images/products/`
2. Update the `image` field in your products table
3. Use paths like `/images/products/your-image.jpg`

### Configure Paynow (Optional)

If you have a Paynow merchant account:

1. Add to `.env.local`:
```env
PAYNOW_INTEGRATION_ID=your_integration_id
PAYNOW_INTEGRATION_KEY=your_integration_key
```

2. Restart the dev server

Without Paynow configured, the store runs in demo mode.

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Check for code issues
```

## Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env.local` file has correct credentials
- Verify your Supabase project is active
- Check your internet connection

### "No products showing"
- Make sure you ran the SQL schema
- Check products have `active = true` in the database
- Verify products exist in the `products` table

### "Images not loading"
- Check image paths in database match files in `public/images/`
- Ensure images are in the correct directory
- Try using absolute paths like `/images/products/image.jpg`

### Port 3001 already in use
```bash
# Use a different port
npm run dev -- -p 3002
```

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 🔄 Check the [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- 📧 Email: gardenguru10@gmail.com

## What's Next?

Once you're comfortable with the basics:

1. Customize the design in `tailwind.config.ts`
2. Update store information in `.env.local`
3. Add more products via Supabase
4. Deploy to Vercel (see README.md)
5. Set up your custom domain

Happy selling! 🌿
