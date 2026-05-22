-- Garden Guru Online Store - Additional Tables for ERP Database
-- Run this in your existing Supabase database to add store functionality
-- This integrates with the existing ERP tables (plants, customers, stock, etc.)

-- ============================================================================
-- HELPER FUNCTIONS (Create if not exists)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ONLINE STORE TABLES
-- ============================================================================

-- Store Product Categories (for organizing online store products)
CREATE TABLE IF NOT EXISTS store_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id BIGINT REFERENCES store_categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Products (links to plants table for inventory management)
CREATE TABLE IF NOT EXISTS store_products (
  id BIGSERIAL PRIMARY KEY,
  plant_id BIGINT REFERENCES plants(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES store_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  weight DECIMAL(8, 2),
  dimensions VARCHAR(100),
  image_url VARCHAR(500),
  gallery_images JSONB DEFAULT '[]',
  badge VARCHAR(50),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  created_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Online Store Orders (separate from ERP sales_orders for public customers)
CREATE TABLE IF NOT EXISTS store_orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(254),
  phone VARCHAR(20) NOT NULL,
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_country VARCHAR(100) DEFAULT 'Zimbabwe',
  billing_address TEXT,
  billing_city VARCHAR(100),
  billing_country VARCHAR(100) DEFAULT 'Zimbabwe',
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_payment',
  payment_method VARCHAR(50) DEFAULT 'paynow',
  payment_status VARCHAR(50) DEFAULT 'pending',
  paynow_poll_url TEXT,
  paynow_reference VARCHAR(100),
  notes TEXT,
  customer_notes TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Order Items
CREATE TABLE IF NOT EXISTS store_order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES store_products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Order Status History
CREATE TABLE IF NOT EXISTS store_order_status_history (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES store_orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  changed_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Reviews (optional - for future enhancement)
CREATE TABLE IF NOT EXISTS store_product_reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES store_products(id) ON DELETE CASCADE,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES store_orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_store_products_category ON store_products(category_id);
CREATE INDEX idx_store_products_plant ON store_products(plant_id);
CREATE INDEX idx_store_products_active ON store_products(is_active);
CREATE INDEX idx_store_products_featured ON store_products(is_featured);
CREATE INDEX idx_store_products_slug ON store_products(slug);
CREATE INDEX idx_store_orders_status ON store_orders(status);
CREATE INDEX idx_store_orders_payment_status ON store_orders(payment_status);
CREATE INDEX idx_store_orders_created_at ON store_orders(created_at DESC);
CREATE INDEX idx_store_orders_customer ON store_orders(customer_id);
CREATE INDEX idx_store_order_items_order ON store_order_items(order_id);
CREATE INDEX idx_store_order_items_product ON store_order_items(product_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_reviews ENABLE ROW LEVEL SECURITY;

-- Public can view active categories
CREATE POLICY "Public can view active store categories" ON store_categories
  FOR SELECT USING (is_active = true);

-- Public can view active products
CREATE POLICY "Public can view active store products" ON store_products
  FOR SELECT USING (is_active = true);

-- Anyone can create orders
CREATE POLICY "Anyone can create store orders" ON store_orders
  FOR INSERT WITH CHECK (true);

-- Anyone can view their own orders
CREATE POLICY "Anyone can view store orders" ON store_orders
  FOR SELECT USING (true);

-- Anyone can create order items
CREATE POLICY "Anyone can create store order items" ON store_order_items
  FOR INSERT WITH CHECK (true);

-- Anyone can view order items
CREATE POLICY "Anyone can view store order items" ON store_order_items
  FOR SELECT USING (true);

-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews" ON store_product_reviews
  FOR SELECT USING (is_approved = true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on store_products
CREATE TRIGGER update_store_products_updated_at 
  BEFORE UPDATE ON store_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp on store_orders
CREATE TRIGGER update_store_orders_updated_at 
  BEFORE UPDATE ON store_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at timestamp on store_categories
CREATE TRIGGER update_store_categories_updated_at 
  BEFORE UPDATE ON store_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert default store categories
INSERT INTO store_categories (name, slug, description, display_order) VALUES
  ('Roses', 'roses', 'Beautiful roses in various colors', 1),
  ('Lilies', 'lilies', 'Elegant lilies for any occasion', 2),
  ('Sunflowers', 'sunflowers', 'Bright and cheerful sunflowers', 3),
  ('Mixed Bouquets', 'mixed-bouquets', 'Vibrant mixed flower arrangements', 4),
  ('Carnations', 'carnations', 'Classic carnations', 5),
  ('Lavender', 'lavender', 'Fragrant lavender bundles', 6),
  ('Orchids', 'orchids', 'Exotic orchid plants', 7),
  ('Tulips', 'tulips', 'Colorful tulips', 8),
  ('Daisies', 'daisies', 'Cheerful daisies', 9),
  ('Seasonal', 'seasonal', 'Seasonal flowers and arrangements', 10)
ON CONFLICT (slug) DO NOTHING;

-- Add store management permissions
INSERT INTO permissions (name, codename, description, module) VALUES
  ('View Store Products', 'view_store_products', 'Can view online store products', 'store'),
  ('Manage Store Products', 'manage_store_products', 'Can create, edit, and delete store products', 'store'),
  ('View Store Orders', 'view_store_orders', 'Can view online store orders', 'store'),
  ('Manage Store Orders', 'manage_store_orders', 'Can manage online store orders', 'store'),
  ('View Store Categories', 'view_store_categories', 'Can view store categories', 'store'),
  ('Manage Store Categories', 'manage_store_categories', 'Can manage store categories', 'store'),
  ('Manage Store Settings', 'manage_store_settings', 'Can manage store settings', 'store')
ON CONFLICT (codename) DO NOTHING;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Integration with ERP:
-- - store_products.plant_id links to plants table for inventory
-- - store_orders.customer_id links to customers table
-- - Stock is managed through the plants/stock tables
-- - When an order is placed, inventory is deducted from stock
-- - ERP users can manage store products through the admin panel
--
-- ============================================================================
