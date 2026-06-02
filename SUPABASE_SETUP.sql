-- Add proof_of_payment_url column to store_orders table
ALTER TABLE store_orders 
ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN store_orders.proof_of_payment_url IS 'URL to uploaded proof of payment for bank transfers';
