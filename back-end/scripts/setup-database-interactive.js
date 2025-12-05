const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
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

// Readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

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
    console.log('  DATABASE SETUP SCRIPT (Interactive)');
    console.log('='.repeat(50) + '\n');

    // Step 1: Connect to MySQL server (without database)
    log.info('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    log.success('Connected to MySQL server');

    // Step 2: Check if database exists
    const dbExists = await databaseExists(connection);
    
    if (dbExists) {
      log.warning(`Database '${dbName}' already exists!`);
      console.log('\nWhat would you like to do?');
      console.log('1. Drop and recreate database (all data will be lost)');
      console.log('2. Skip database creation, only run SQL file');
      console.log('3. Exit\n');
      
      const answer = await question('Enter your choice (1/2/3): ');
      
      if (answer === '3') {
        log.info('Setup cancelled by user');
        process.exit(0);
      } else if (answer === '1') {
        await executeSQL(connection, `DROP DATABASE IF EXISTS \`${dbName}\``, 'Dropping existing database');
        await executeSQL(connection, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``, `Creating database '${dbName}'`);
      } else if (answer === '2') {
        log.info('Skipping database creation, using existing database');
      } else {
        log.error('Invalid choice');
        process.exit(1);
      }
    } else {
      // Step 3: Create database
      await executeSQL(connection, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``, `Creating database '${dbName}'`);
    }

    // Step 4: Use database
    await executeSQL(connection, `USE \`${dbName}\``, `Using database '${dbName}'`);

    // Step 5: Read and execute SQL file
    log.info('Reading SQL file...');
    const sqlFile = readSQLFile('config/db_complete.sql');
    
    // Remove CREATE DATABASE and USE statements from SQL file (already handled)
    const cleanedSQL = sqlFile
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '')
      .replace(/USE.*?;/gi, '')
      .trim();

    // Step 6: Execute SQL statements
    log.info('Executing SQL statements...');
    await executeSQL(connection, cleanedSQL, 'Creating tables and inserting data');

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
    rl.close();
  }
};

// Run setup
setupDatabase();

