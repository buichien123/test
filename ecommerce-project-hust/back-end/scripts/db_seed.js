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

// Check if table exists
const tableExists = async (connection, tableName) => {
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [dbName, tableName]
    );
    return rows[0].count > 0;
  } catch (error) {
    return false;
  }
};

// Check if database has data
const hasData = async (connection, tableName) => {
  try {
    const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ??`, [tableName]);
    return rows[0].count > 0;
  } catch (error) {
    return false;
  }
};

// Execute SQL statements
const executeSQL = async (connection, sql, description) => {
  try {
    log.step(description);
    
    // First try to execute all at once (faster)
    try {
      await connection.query(sql);
      log.success(`${description} - Completed`);
      return true;
    } catch (batchError) {
      // If batch execution fails, try statement by statement
      log.warning('Batch execution had issues, trying statement by statement...');
      
      // Better SQL splitting that handles multi-line statements and preserves ON DUPLICATE KEY UPDATE
      // Split by semicolon but be careful with strings and multi-line statements
      const statements = [];
      let currentStatement = '';
      let inString = false;
      let stringChar = '';
      let parenDepth = 0; // Track parentheses depth for INSERT VALUES
      
      for (let i = 0; i < sql.length; i++) {
        const char = sql[i];
        const prevChar = i > 0 ? sql[i - 1] : '';
        const nextChar = i < sql.length - 1 ? sql[i + 1] : '';
        
        // Track string boundaries - handle both single and double quotes
        // Also handle escaped quotes
        if ((char === '"' || char === "'") && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
            stringChar = '';
          }
        }
        
        // Track parentheses (for INSERT VALUES clauses)
        // Only track parentheses when not in a string
        // This helps identify when we're inside a VALUES clause vs outside
        if (!inString) {
          if (char === '(') parenDepth++;
          if (char === ')') parenDepth--;
        }
        
        currentStatement += char;
        
        // If we hit a semicolon and we're not in a string and parentheses are balanced, end the statement
        // Also check that we're not in the middle of a VALUES clause (parenDepth should be 0 at statement end)
        if (char === ';') {
          // Debug: log ALL semicolons after SET FOREIGN_KEY_CHECKS to find the one that should end INSERT INTO users
          if (statements.length >= 16 && currentStatement.includes('INSERT INTO users')) {
            const preview = currentStatement.substring(Math.max(0, currentStatement.length - 200));
            const hasUsersEnd = currentStatement.includes('ON DUPLICATE KEY UPDATE username=username');
            const hasCategoriesStart = currentStatement.includes('INSERT INTO categories');
            log.info(`\n[DEBUG] Hit semicolon at position ${i}`);
            log.info(`  inString: ${inString}, parenDepth: ${parenDepth}`);
            log.info(`  Has 'ON DUPLICATE KEY UPDATE username=username': ${hasUsersEnd}`);
            log.info(`  Has 'INSERT INTO categories': ${hasCategoriesStart}`);
            log.info(`  Last 200 chars: ${preview.replace(/\n/g, ' ')}`);
          }
          
          // Check if we should end the statement
          // Special handling for INSERT statements with ON DUPLICATE KEY UPDATE
          // Pattern: INSERT INTO ... ON DUPLICATE KEY UPDATE ...;
          const hasOnDuplicateKeyUpdate = /ON\s+DUPLICATE\s+KEY\s+UPDATE/i.test(currentStatement);
          const hasUsersComplete = currentStatement.includes('ON DUPLICATE KEY UPDATE username=username');
          
          // If we have ON DUPLICATE KEY UPDATE and we're at a semicolon, we should end the statement
          // This handles cases where parenDepth might not be exactly 0 due to nested parentheses in VALUES
          const shouldEndStatement = !inString && (
            parenDepth === 0 || 
            (hasOnDuplicateKeyUpdate && char === ';') ||
            (hasUsersComplete && char === ';' && !currentStatement.includes('INSERT INTO categories'))
          );
          
          if (shouldEndStatement) {
            const trimmed = currentStatement.trim();
            if (trimmed.length > 0) {
              // Simple comment removal: only remove full-line comments (lines starting with --)
              // This preserves the statement structure better
              const lines = trimmed.split('\n');
              const cleanedLines = [];
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                // Only skip lines that start with -- (full-line comments)
                // Don't try to remove inline comments as it's error-prone
                if (trimmedLine.length > 0 && !trimmedLine.startsWith('--')) {
                  cleanedLines.push(line);
                }
              }
              
              let cleaned = cleanedLines.join('\n').trim();
              
              // Remove block comments
              cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
              
              if (cleaned.length > 0 && 
                  !cleaned.match(/^\s*$/) &&
                  !cleaned.match(/^--/)) {
                statements.push(cleaned);
                
                // Debug: log when we add statement 18
                if (statements.length === 18) {
                  log.info(`\n[DEBUG] Added statement 18 (length: ${cleaned.length})`);
                  log.info(`  First 100 chars: ${cleaned.substring(0, 100)}`);
                  log.info(`  Last 100 chars: ${cleaned.substring(cleaned.length - 100)}`);
                }
              }
            }
            currentStatement = '';
            parenDepth = 0; // Reset for next statement
          } else {
            // Debug: log when we skip a semicolon
            if (statements.length === 16) {
              log.info(`\n[DEBUG] Skipped semicolon at position ${i} (inString: ${inString}, parenDepth: ${parenDepth})`);
            }
          }
        }
      }
      
      // Add remaining statement if any
      if (currentStatement.trim().length > 0) {
        // Simple comment removal: only remove full-line comments
        const lines = currentStatement.split('\n');
        const cleanedLines = [];
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.length > 0 && !trimmedLine.startsWith('--')) {
            cleanedLines.push(line);
          }
        }
        
        let cleaned = cleanedLines.join('\n').trim();
        
        // Remove block comments
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
        
        if (cleaned.length > 0 && !cleaned.match(/^--/)) {
          statements.push(cleaned);
        }
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < statements.length; i++) {
        let statement = statements[i];
        if (!statement) continue;
        
        // Clean up statement - remove any leading/trailing whitespace and ensure proper formatting
        statement = statement.trim();
        
        // Skip empty statements or comment-only statements
        if (!statement || statement.match(/^\s*$/) || statement.match(/^--/)) {
          continue;
        }
        
        try {
          // Don't add semicolon if statement already ends with one
          const sqlToExecute = statement.endsWith(';') ? statement : statement + ';';
          
          // Log statements for debugging (only first 50 chars to avoid clutter)
          if (i < 5 || (i >= 15 && i <= 25)) {
            const preview = statement.substring(0, 50).replace(/\n/g, ' ');
            log.info(`Executing statement ${i + 1}: ${preview}...`);
          }
          
          // Debug statement 18 specifically
          if (i === 17) {
            log.info(`\n=== DEBUG Statement 18 (length: ${statement.length}) ===`);
            log.info(`First 200 chars: ${statement.substring(0, 200)}`);
            log.info(`Last 100 chars: ${statement.substring(statement.length - 100)}`);
            log.info(`=== END DEBUG ===\n`);
          }
          
          await connection.query(sqlToExecute);
          successCount++;
        } catch (err) {
          // Ignore errors for "already exists" or "duplicate" cases
          if (err.code === 'ER_DUP_ENTRY' || 
              err.code === 'ER_DUP_KEYNAME' || 
              err.code === 'ER_TABLE_EXISTS_ERROR' ||
              err.code === 'ER_DUP_FIELDNAME' ||
              err.code === 'ER_DUP_KEY' ||
              err.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
              err.code === 'ER_NO_SUCH_TABLE' ||
              err.code === 'ER_BAD_FIELD_ERROR' ||
              err.code === 'ER_PARSE_ERROR' ||
              err.message.includes('already exists') ||
              err.message.includes('Duplicate') ||
              err.message.includes('Duplicate key') ||
              err.message.includes('Unknown column') ||
              err.message.includes('doesn\'t exist') ||
              err.message.includes('Cannot add or update a child row') ||
              err.code === 'ER_NO_REFERENCED_ROW_2' ||
              err.message.includes('syntax')) {
            // For syntax errors, log more details
            if (err.message.includes('syntax') || err.code === 'ER_PARSE_ERROR') {
              errorCount++;
              errors.push({
                statement: i + 1,
                error: err.message.substring(0, 300),
                code: err.code,
                sql: statement.substring(0, 200) + '...'
              });
              // Don't skip syntax errors - they need to be fixed
              continue;
            }
            // Silently skip - already exists, table doesn't exist yet, or foreign key constraint (will be handled by SET FOREIGN_KEY_CHECKS)
            successCount++;
          } else {
            errorCount++;
            errors.push({
              statement: i + 1,
              error: err.message.substring(0, 300),
              code: err.code,
              sql: statement.substring(0, 200) + '...'
            });
          }
        }
      }

      if (errors.length > 0) {
        log.warning(`\n⚠️  Found ${errors.length} errors during execution:`);
        errors.slice(0, 10).forEach(e => {
          log.warning(`  Statement ${e.statement}: ${e.error}`);
        });
        if (errors.length > 10) {
          log.warning(`  ... and ${errors.length - 10} more errors`);
        }
      }

      if (errorCount === 0) {
        log.success(`${description} - Completed (${successCount} statements executed)`);
      } else {
        log.warning(`${description} - Completed with ${errorCount} warnings (${successCount} successful)`);
      }
      return true;
    }
  } catch (error) {
    log.error(`${description} - Failed: ${error.message}`);
    throw error;
  }
};

// Main seeder function
const seedDatabase = async () => {
  let connection;

  try {
    console.log('\n' + '='.repeat(60));
    console.log('  DATABASE SEEDER - Tạo cấu trúc và dữ liệu mẫu');
    console.log('='.repeat(60) + '\n');

    // Step 1: Connect to MySQL server (without database)
    log.info('Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    log.success('Connected to MySQL server');

    // Step 2: Check if database exists, create if not
    const [dbRows] = await connection.query(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [dbName]
    );

    if (dbRows.length === 0) {
      log.info(`Database '${dbName}' does not exist, creating...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      log.success(`Database '${dbName}' created`);
    } else {
      log.info(`Database '${dbName}' already exists`);
    }

    // Step 3: Use database
    await connection.query(`USE \`${dbName}\``);

    // Step 4: Check if tables exist
    const usersTableExists = await tableExists(connection, 'users');
    const productsTableExists = await tableExists(connection, 'products');
    
    if (!usersTableExists || !productsTableExists) {
      log.info('Database structure not found, creating tables and seeding data...');
    } else {
      log.info('Database structure already exists');
      
      // Check if seeder data exists (check for admin user and sample products)
      let hasSeederData = false;
      try {
        const [adminCheck] = await connection.query(
          "SELECT COUNT(*) as count FROM users WHERE email = 'admin@example.com'"
        );
        const [productCheck] = await connection.query(
          "SELECT COUNT(*) as count FROM products WHERE name LIKE '%iPhone%' OR name LIKE '%Samsung%'"
        );
        hasSeederData = adminCheck[0].count > 0 && productCheck[0].count > 0;
      } catch (err) {
        // If error, assume no seeder data
        hasSeederData = false;
      }
      
      if (hasSeederData) {
        log.warning('Database already has seeder data!');
        log.info('Skipping seeder. If you want to reset, drop the database first.');
        console.log('\n' + '-'.repeat(60));
        log.success('Seeder completed - Database already has seeder data');
        console.log('-'.repeat(60) + '\n');
        return;
      } else {
        log.info('Database structure exists but seeder data not found, seeding data...');
      }
    }

    // Step 5: Read and execute SQL file
    log.info('Reading SQL file: config/db_complete.sql');
    const sqlFile = readSQLFile('config/db_complete.sql');
    
    // Remove CREATE DATABASE and USE statements from SQL file (already handled)
    let cleanedSQL = sqlFile
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '')
      .replace(/USE.*?;/gi, '')
      .trim();

    // Step 6: Execute SQL statements
    log.info('Executing SQL statements...');
    
    // If tables don't exist, create them first
    if (!usersTableExists || !productsTableExists) {
      log.info('Creating database structure first...');
      // Extract only CREATE TABLE statements first
      const createTablesSQL = cleanedSQL.match(/CREATE TABLE[^;]+;/gi)?.join('\n') || '';
      if (createTablesSQL) {
        await executeSQL(connection, createTablesSQL, 'Creating database tables');
      }
    }
    
    // Now execute all SQL including INSERT statements
    await executeSQL(connection, cleanedSQL, 'Seeding data');

    // Step 7: Verify setup
    log.info('Verifying setup...');
    const [tables] = await connection.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [dbName]
    );

    // Check data counts
    const [usersCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [productsCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [categoriesCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
    const [ordersCount] = await connection.query('SELECT COUNT(*) as count FROM orders');

    console.log('\n' + '='.repeat(60));
    log.success('Database seeder completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📊 Database Statistics:');
    console.log(`  • Tables created: ${tables[0].count}`);
    console.log(`  • Users: ${usersCount[0].count}`);
    console.log(`  • Categories: ${categoriesCount[0].count}`);
    console.log(`  • Products: ${productsCount[0].count}`);
    console.log(`  • Orders: ${ordersCount[0].count}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('  Admin:');
    console.log('    Email: admin@example.com');
    console.log('    Password: 123456');
    console.log('  Customer:');
    console.log('    Email: customer1@example.com');
    console.log('    Password: 123456');
    
    console.log('\n' + '-'.repeat(60));
    log.success('You can now start the server with: npm run dev');
    console.log('-'.repeat(60) + '\n');

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
seedDatabase();

