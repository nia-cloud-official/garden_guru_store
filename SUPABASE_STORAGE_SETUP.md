# Supabase Storage Setup for Bank Transfer

## Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/corlssldodxydzihxydm
2. Click on **Storage** in the left sidebar
3. Click **New bucket**
4. Enter the following details:
   - **Name:** `store-assets`
   - **Public bucket:** ✅ Check this box (files need to be accessible via URL)
5. Click **Create bucket**

## Set Bucket Permissions

After creating the bucket, set the following policies:

### Policy 1: Allow Public Read Access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-assets');
```

### Policy 2: Allow Authenticated Uploads
```sql
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'store-assets');
```

## Verify Setup

Test by uploading a file via the API at `/api/checkout/bank-transfer`

The uploaded files will be stored in: `store-assets/proof-of-payments/`

## Access URLs

Files will be accessible at:
```
https://corlssldodxydzihxydm.supabase.co/storage/v1/object/public/store-assets/proof-of-payments/[filename]
```
