-- Add proof_of_payment_url column to store_orders table
-- This column stores the URL of the uploaded proof of payment for bank transfer orders

ALTER TABLE store_orders 
ADD COLUMN IF NOT EXISTS proof_of_payment_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN store_orders.proof_of_payment_url IS 'URL to the uploaded proof of payment document (for bank transfer orders)';

-- Create index for faster queries on orders with proof of payment
CREATE INDEX IF NOT EXISTS idx_store_orders_proof_of_payment 
ON store_orders(proof_of_payment_url) 
WHERE proof_of_payment_url IS NOT NULL;
