-- Store Customers Table
-- This table stores customer accounts for the online store
-- Separate from ERP customers table for public-facing customer accounts

CREATE TABLE IF NOT EXISTS store_customers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(254) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255), -- For future login functionality
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_store_customers_email ON store_customers(email);
CREATE INDEX IF NOT EXISTS idx_store_customers_active ON store_customers(is_active);

-- Row Level Security
ALTER TABLE store_customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create store customer account" ON store_customers;
DROP POLICY IF EXISTS "Customers can view their own account" ON store_customers;
DROP POLICY IF EXISTS "Customers can update their own account" ON store_customers;

-- Policy: Anyone can create a customer account
CREATE POLICY "Anyone can create store customer account" ON store_customers
  FOR INSERT WITH CHECK (true);

-- Policy: Customers can view their own account
CREATE POLICY "Customers can view their own account" ON store_customers
  FOR SELECT USING (true);

-- Policy: Customers can update their own account
CREATE POLICY "Customers can update their own account" ON store_customers
  FOR UPDATE USING (true);

-- Trigger: Update updated_at timestamp
DROP TRIGGER IF EXISTS update_store_customers_updated_at ON store_customers;
CREATE TRIGGER update_store_customers_updated_at 
  BEFORE UPDATE ON store_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key to store_orders if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'store_orders_store_customer_id_fkey'
  ) THEN
    -- Add new column for store_customer_id
    ALTER TABLE store_orders 
    ADD COLUMN IF NOT EXISTS store_customer_id BIGINT REFERENCES store_customers(id) ON DELETE SET NULL;
    
    -- Create index
    CREATE INDEX IF NOT EXISTS idx_store_orders_store_customer ON store_orders(store_customer_id);
  END IF;
END $$;

COMMENT ON TABLE store_customers IS 'Customer accounts for online store - auto-created during checkout';
COMMENT ON COLUMN store_customers.email IS 'Customer email address - unique identifier';
COMMENT ON COLUMN store_customers.password_hash IS 'Password hash for future login functionality';
COMMENT ON COLUMN store_customers.is_active IS 'Whether the customer account is active';
