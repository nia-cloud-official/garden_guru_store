-- Add a shared catalog of store images for reliable internal image links
-- This table stores canonical image metadata and the public URL we use in products.

CREATE TABLE IF NOT EXISTS store_images (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  source_url VARCHAR(500),
  public_url VARCHAR(500) NOT NULL,
  tags JSONB DEFAULT '[]',
  license VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_images_slug ON store_images(slug);
CREATE INDEX IF NOT EXISTS idx_store_images_active ON store_images(is_active);

ALTER TABLE store_images ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Public can view active store images'
      AND polrelid = 'store_images'::regclass
  ) THEN
    CREATE POLICY "Public can view active store images" ON store_images
      FOR SELECT USING (is_active = true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_store_images_updated_at'
      AND tgrelid = 'store_images'::regclass
  ) THEN
    CREATE TRIGGER update_store_images_updated_at
      BEFORE UPDATE ON store_images
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
