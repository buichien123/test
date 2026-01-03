const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce_db",
  multipleStatements: true,
};

const blogTablesSQL = `
-- Blog Posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(255),
  author_id INT NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  views INT DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at DATETIME NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_author_id (author_id),
  INDEX idx_status (status),
  INDEX idx_slug (slug),
  INDEX idx_published_at (published_at),
  FULLTEXT idx_search (title, excerpt, content)
);

-- Blog Comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT,
  parent_id INT NULL COMMENT 'For nested comments/replies',
  name VARCHAR(100) NOT NULL COMMENT 'Guest name if not logged in',
  email VARCHAR(100) COMMENT 'Guest email if not logged in',
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (parent_id) REFERENCES blog_comments(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_status (status)
);

-- Blog Categories/Tags (optional, for organizing posts)
CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
);

-- Blog Post Categories (many-to-many relationship)
CREATE TABLE IF NOT EXISTS blog_post_categories (
  post_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE
);
`;

const checkTableExists = async (connection, tableName) => {
  try {
    const [rows] = await connection.query(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [dbConfig.database, tableName]
    );
    return rows[0].count > 0;
  } catch (error) {
    return false;
  }
};

const main = async () => {
  let connection;

  try {
    console.log("\n" + "=".repeat(50));
    console.log("  CREATE BLOG TABLES");
    console.log("=".repeat(50) + "\n");

    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database:", dbConfig.database);

    // Check existing tables
    const blogTables = [
      "blog_posts",
      "blog_comments",
      "blog_categories",
      "blog_post_categories",
    ];
    const existingTables = [];

    for (const table of blogTables) {
      const exists = await checkTableExists(connection, table);
      if (exists) {
        existingTables.push(table);
        console.log(`ℹ  Table '${table}' already exists`);
      }
    }

    if (existingTables.length === blogTables.length) {
      console.log("\n✅ All blog tables already exist!");
      return;
    }

    console.log("\n📝 Creating blog tables...");
    await connection.query(blogTablesSQL);
    console.log("✅ Blog tables created successfully!");

    // Verify
    console.log("\n📋 Verifying tables...");
    for (const table of blogTables) {
      const exists = await checkTableExists(connection, table);
      console.log(`${exists ? "✅" : "❌"} ${table}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

main();
