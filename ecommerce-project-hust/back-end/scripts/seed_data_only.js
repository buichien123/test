const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}→${colors.reset} ${msg}`)
};

// Database configuration from .env
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  multipleStatements: true
};

const dbName = process.env.DB_NAME || 'ecommerce_db';

// Read SQL file and extract only INSERT statements
const extractInsertStatements = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Extract only INSERT statements (from "-- USERS SEEDER" to end)
    const seederStart = content.indexOf('-- ============================================');
    const seederSection = content.indexOf('-- SEEDER DATA');
    
    if (seederSection === -1) {
      // If no seeder section marker, get everything after CREATE TABLE statements
      const lines = content.split('\n');
      let startLine = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-- USERS SEEDER') || lines[i].includes('INSERT INTO users')) {
          startLine = i;
          break;
        }
      }
      return lines.slice(startLine).join('\n');
    }
    
    return content.substring(seederSection);
  } catch (error) {
    log.error(`Cannot read file: ${filePath}`);
    throw error;
  }
};

// Execute INSERT statements
const seedData = async () => {
  let connection;

  try {
    console.log('\n' + '='.repeat(60));
    console.log('  SEED DATA ONLY - Chỉ thêm dữ liệu mẫu');
    console.log('='.repeat(60) + '\n');

    // Connect to database
    log.info('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    log.success('Connected to database');

    // Check if tables exist
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [dbName]
    );

    if (tables.length === 0) {
      log.error('Database tables do not exist! Please run db_seed.js first to create tables.');
      return;
    }

    log.info(`Found ${tables.length} tables in database`);

    // Check if data already exists
    try {
      const [usersCount] = await connection.query('SELECT COUNT(*) as count FROM users');
      const [productsCount] = await connection.query('SELECT COUNT(*) as count FROM products');
      
      if (usersCount[0].count > 0 || productsCount[0].count > 0) {
        log.warning('Database already has data!');
        log.info('Skipping seeder. If you want to reset, truncate tables first.');
        return;
      }
    } catch (err) {
      // Tables might not exist yet
      log.warning('Could not check existing data, proceeding...');
    }

    // Read and extract INSERT statements
    log.info('Reading SQL file: config/db_complete.sql');
    const insertSQL = extractInsertStatements('config/db_complete.sql');
    
    // Remove comments and clean up
    let cleanedSQL = insertSQL
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('--') && 
               trimmed.length > 0 &&
               !trimmed.startsWith('SET FOREIGN_KEY_CHECKS');
      })
      .join('\n')
      .replace(/--.*$/gm, '') // Remove inline comments
      .trim();

    // Execute INSERT statements
    log.info('Executing INSERT statements...');
    
    try {
      await connection.query(cleanedSQL);
      log.success('All INSERT statements executed successfully');
    } catch (error) {
      log.warning('Batch execution had issues, trying statement by statement...');
      
      // Split by semicolon but preserve multi-line INSERT statements
      const statements = cleanedSQL
        .split(/;\s*(?=\n|$)/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.toUpperCase().includes('INSERT'));

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement) continue;

        try {
          await connection.query(statement);
          successCount++;
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY' || 
              err.message.includes('Duplicate') ||
              err.message.includes('already exists')) {
            // Skip duplicates
            successCount++;
          } else {
            errorCount++;
            errors.push({
              statement: i + 1,
              error: err.message.substring(0, 200),
              code: err.code
            });
            log.warning(`Statement ${i + 1} failed: ${err.message.substring(0, 100)}`);
          }
        }
      }

      if (errors.length > 0) {
        log.warning(`\n⚠️  Found ${errors.length} errors:`);
        errors.slice(0, 5).forEach(e => {
          log.warning(`  Statement ${e.statement}: ${e.error}`);
        });
      }

      log.success(`Executed ${successCount} INSERT statements${errorCount > 0 ? `, ${errorCount} errors` : ''}`);
    }

    // Verify data
    log.info('Verifying data...');
    const [usersCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [productsCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [categoriesCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
    const [ordersCount] = await connection.query('SELECT COUNT(*) as count FROM orders');

    console.log('\n' + '='.repeat(60));
    log.success('Data seeding completed!');
    console.log('='.repeat(60));
    console.log('\n📊 Data Statistics:');
    console.log(`  • Users: ${usersCount[0].count}`);
    console.log(`  • Categories: ${categoriesCount[0].count}`);
    console.log(`  • Products: ${productsCount[0].count}`);
    console.log(`  • Orders: ${ordersCount[0].count}`);
    
    console.log('\n' + '-'.repeat(60) + '\n');

  } catch (error) {
    log.error('Seeder failed!');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log.info('Database connection closed');
    }
  }
};

// Run seeder
seedData();

