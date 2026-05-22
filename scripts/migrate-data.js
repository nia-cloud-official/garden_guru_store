/**
 * Data Migration Script
 * Migrates products and categories from PHP JSON files to Supabase
 * 
 * Usage:
 * 1. Set your Supabase credentials in .env.local
 * 2. Run: node scripts/migrate-data.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Paths to old PHP data files
const OLD_STORE_PATH = path.join(__dirname, '../../store');
const PRODUCTS_FILE = path.join(OLD_STORE_PATH, 'data/products.json');
const CATEGORIES_FILE = path.join(OLD_STORE_PATH, 'data/categories.json');

async function migrateCategories() {
  console.log('\n📁 Migrating categories...');
  
  if (!fs.existsSync(CATEGORIES_FILE)) {
    console.log('⚠️  Categories file not found, skipping...');
    return;
  }

  const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  
  for (const category of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert({ name: category }, { onConflict: 'name' });
    
    if (error) {
      console.error(`❌ Error inserting category "${category}":`, error.message);
    } else {
      console.log(`✅ Migrated category: ${category}`);
    }
  }
}

async function migrateProducts() {
  console.log('\n🌿 Migrating products...');
  
  if (!fs.existsSync(PRODUCTS_FILE)) {
    console.log('⚠️  Products file not found, skipping...');
    return;
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  
  for (const product of products) {
    // Transform image path from old format to new format
    let imagePath = product.image;
    if (imagePath && imagePath.startsWith('img/product/')) {
      imagePath = imagePath.replace('img/product/', '/images/products/');
    }

    const productData = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      image: imagePath,
      description: product.description || '',
      badge: product.badge || '',
      active: product.active !== false,
    };

    const { error } = await supabase
      .from('products')
      .upsert(productData, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error inserting product "${product.name}":`, error.message);
    } else {
      console.log(`✅ Migrated product: ${product.name}`);
    }
  }
}

async function migrateOrders() {
  console.log('\n📦 Migrating orders...');
  
  const ORDERS_FILE = path.join(OLD_STORE_PATH, 'data/orders.json');
  
  if (!fs.existsSync(ORDERS_FILE)) {
    console.log('⚠️  Orders file not found, skipping...');
    return;
  }

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  
  for (const order of orders) {
    // Insert order
    const orderData = {
      order_id: order.order_id,
      first_name: order.first_name,
      last_name: order.last_name,
      phone: order.phone,
      subtotal: parseFloat(order.subtotal),
      status: order.status || 'pending_payment',
      created_at: order.created_at,
      updated_at: order.updated_at,
    };

    const { error: orderError } = await supabase
      .from('orders')
      .upsert(orderData, { onConflict: 'order_id' });
    
    if (orderError) {
      console.error(`❌ Error inserting order "${order.order_id}":`, orderError.message);
      continue;
    }

    // Insert order items
    if (order.cart) {
      for (const [productId, item] of Object.entries(order.cart)) {
        const itemData = {
          order_id: order.order_id,
          product_id: parseInt(productId),
          product_name: item.product.name,
          product_price: parseFloat(item.product.price),
          quantity: item.qty,
          line_total: parseFloat(item.product.price) * item.qty,
        };

        const { error: itemError } = await supabase
          .from('order_items')
          .insert(itemData);
        
        if (itemError) {
          console.error(`❌ Error inserting order item:`, itemError.message);
        }
      }
    }

    console.log(`✅ Migrated order: ${order.order_id}`);
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });
  
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Categories: ${categoryCount || 0}`);
  console.log(`   Products: ${productCount || 0}`);
  console.log(`   Orders: ${orderCount || 0}`);
}

async function main() {
  console.log('🚀 Starting data migration...');
  console.log(`📂 Looking for data in: ${OLD_STORE_PATH}`);
  
  try {
    await migrateCategories();
    await migrateProducts();
    await migrateOrders();
    await verifyMigration();
    
    console.log('\n✨ Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Copy images from store/img/product/ to store-nextjs/public/images/products/');
    console.log('   2. Run: npm run dev');
    console.log('   3. Visit: http://localhost:3001');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
