const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function initDb() {
  console.log('--- Initializing PostgreSQL Database ---');
  let client;
  try {
    client = await pool.connect();
    
    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await client.query(schemaSql);
    console.log('✓ Tables created / verified successfully.');

    // Check if products already exist to keep initialization idempotent
    const checkProducts = await client.query('SELECT COUNT(*) FROM products');
    const count = parseInt(checkProducts.rows[0].count, 10);

    if (count === 0) {
      console.log('Database contains 0 products. Running seed.sql...');
      const seedPath = path.join(__dirname, 'seed.sql');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('✓ Seed product data inserted successfully.');
    } else {
      console.log(`✓ Products table already populated (${count} products found). Skipping duplicate seed.`);
    }

    console.log('--- Database Initialization Complete ---');
  } catch (error) {
    console.error('Database initialization warning/error:', error.message);
    console.log('Note: Ensure PostgreSQL server is running and database connection parameters in backend/.env are accurate.');
  } finally {
    if (client) client.release();
  }
}

if (require.main === module) {
  initDb().then(() => pool.end());
}

module.exports = initDb;
