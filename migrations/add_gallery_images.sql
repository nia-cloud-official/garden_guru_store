-- Add gallery_images column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'store_products' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE store_products ADD COLUMN gallery_images JSONB DEFAULT '[]';
  END IF;
END $$;

-- Update existing products to have empty array if null
UPDATE store_products SET gallery_images = '[]' WHERE gallery_images IS NULL;
