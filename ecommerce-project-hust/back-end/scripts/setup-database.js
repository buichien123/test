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
  multipleStatements: true
};

const dbName = process.env.DB_NAME || 'ecommerce_db';

// Read SQL file
const readSQLFile = (filePath) => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    log.error(`Cannot read file: ${filePath}`);
    throw error;
  }
};

// Execute SQL statements
const executeSQL = async (connection, sql, description) => {
  try {
    log.step(description);
    await connection.query(sql);
    log.success(`${description} - Completed`);
    return true;
  } catch (error) {
    log.error(`${description} - Failed: ${error.message}`);
    throw error;
  }
};

// Check if database exists
const databaseExists = async (connection) => {
  try {
    const [rows] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [dbName]
    );
    return rows.length > 0;
  } catch (error) {
    return false;
  }
};

// Main setup function
const setupDatabase = async () => {
  let connection;

  try {
    console.log('\n' + '='.repeat(50));
    console.log('  DATABASE SETUP SCRIPT');
    console.log('='.repeat(50) + '\n');

    // Step 1: Connect to MySQL server (without database)
    log.info('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    log.success('Connected to MySQL server');

    // Step 2: Check if database exists
    const dbExists = await databaseExists(connection);
    
    if (dbExists) {
      log.warning(`Database '${dbName}' already exists!`);
      console.log('\nOptions:');
      console.log('1. Drop and recreate database (all data will be lost)');
      console.log('2. Skip database creation, only run SQL file');
      console.log('3. Exit\n');
      
      // For automated setup, we'll drop and recreate
      // In production, you might want to add prompts
      log.info('Auto-selecting: Drop and recreate database');
      await executeSQL(connection, `DROP DATABASE IF EXISTS \`${dbName}\``, 'Dropping existing database');
    }

    // Step 3: Create database
    await executeSQL(connection, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``, `Creating database '${dbName}'`);

    // Step 4: Use database
    await executeSQL(connection, `USE \`${dbName}\``, `Using database '${dbName}'`);

    // Step 5: Read and execute SQL file
    log.info('Reading SQL file...');
    const sqlFile = readSQLFile('config/db_complete.sql');
    
    // Remove CREATE DATABASE and USE statements from SQL file (already handled)
    let cleanedSQL = sqlFile
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '')
      .replace(/USE.*?;/gi, '')
      .trim();

    // Step 6: Execute SQL statements
    // Use multipleStatements: true to execute all at once
    log.info('Executing SQL statements...');
    try {
      await connection.query(cleanedSQL);
      log.success('All SQL statements executed successfully');
    } catch (error) {
      // If error, try executing statement by statement for better error handling
      log.warning('Batch execution failed, trying statement by statement...');
      
      // Split by semicolon but preserve multi-line statements
      const statements = cleanedSQL
        .split(/;(?![^']*'[^']*')/g) // Split by ; but not inside quotes
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.match(/^--/));

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        // Skip empty statements and comments
        if (!statement || statement.match(/^--/)) continue;
        
        try {
          await connection.query(statement + ';');
          successCount++;
        } catch (err) {
          // Ignore errors for "already exists" or "duplicate" cases
          if (err.code === 'ER_DUP_ENTRY' || 
              err.code === 'ER_DUP_KEYNAME' || 
              err.code === 'ER_TABLE_EXISTS_ERROR' ||
              err.code === 'ER_DUP_FIELDNAME' ||
              err.message.includes('already exists') ||
              err.message.includes('Duplicate') ||
              err.message.includes('Duplicate key')) {
            // Silently skip - table/constraint already exists
            successCount++;
          } else {
            failCount++;
            log.warning(`Statement ${i + 1} failed: ${err.message.substring(0, 150)}`);
            // Continue with other statements
          }
        }
      }

      log.success(`Executed ${successCount} statements successfully${failCount > 0 ? `, ${failCount} skipped/errors` : ''}`);
      
      if (failCount > 0) {
        log.warning('Some statements had errors, but continuing...');
      }
    }

    // Step 7: Verify setup
    log.info('Verifying setup...');
    const [tables] = await connection.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [dbName]
    );

    log.success(`Database setup completed successfully!`);
    log.info(`Total tables created: ${tables[0].count}`);

    // Show created tables
    const [tableList] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
      [dbName]
    );

    console.log('\n' + '-'.repeat(50));
    console.log('Created tables:');
    tableList.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.TABLE_NAME}`);
    });
    console.log('-'.repeat(50) + '\n');

    log.success('Setup completed! You can now start the server.');
    console.log('Run: npm run dev\n');

  } catch (error) {
    log.error('Setup failed!');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log.info('Database connection closed');
    }
  }
};

// Run setup
setupDatabase();

