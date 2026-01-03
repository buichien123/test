const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce_db",
  multipleStatements: true,
};

const blogCategoriesData = [
  ["Công nghệ", "cong-nghe", "Tin tức và đánh giá về công nghệ mới nhất"],
  [
    "Đánh giá sản phẩm",
    "danh-gia-san-pham",
    "Đánh giá chi tiết các sản phẩm công nghệ",
  ],
  ["Hướng dẫn", "huong-dan", "Hướng dẫn sử dụng và mẹo vặt công nghệ"],
  ["Tin tức", "tin-tuc", "Tin tức mới nhất về công nghệ và thị trường"],
  ["So sánh", "so-sanh", "So sánh các sản phẩm công nghệ"],
];

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
    console.log("  INSERT BLOG DATA");
    console.log("=".repeat(50) + "\n");

    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database:", dbConfig.database);

    // Check if blog tables exist, create if not
    const blogPostsExists = await checkTableExists(connection, "blog_posts");
    const blogCategoriesExists = await checkTableExists(
      connection,
      "blog_categories"
    );

    if (!blogPostsExists || !blogCategoriesExists) {
      console.log("📝 Blog tables not found, creating...");
      await connection.query(blogTablesSQL);
      console.log("✅ Blog tables created successfully!");
    } else {
      console.log("ℹ  Blog tables already exist");
    }

    // Check if admin user exists (author_id = 1)
    const [adminCheck] = await connection.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );
    if (adminCheck.length === 0) {
      console.error(
        "❌ Error: Admin user not found. Please run insert_users_data.js first!"
      );
      process.exit(1);
    }
    const authorId = adminCheck[0].id;

    // Insert blog categories
    console.log("\n📝 Inserting blog categories...");
    const categoriesQuery = `INSERT INTO blog_categories (name, slug, description) VALUES ? 
                            ON DUPLICATE KEY UPDATE name=name`;
    await connection.query(categoriesQuery, [blogCategoriesData]);
    console.log(`✅ Inserted ${blogCategoriesData.length} blog categories`);

    // Read blog posts from SQL file (since they have long content)
    console.log("\n📝 Reading blog posts from SQL file...");
    const fs = require("fs");
    const path = require("path");
    const sqlFilePath = path.join(__dirname, "..", "config", "db_complete.sql");

    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ Error: SQL file not found at ${sqlFilePath}`);
      process.exit(1);
    }

    const sqlFile = fs.readFileSync(sqlFilePath, "utf8");

    // Extract blog seeder section
    const blogSeederMatch = sqlFile.match(
      /-- ============================================\s*-- BLOG SEEDER DATA\s*-- ============================================(.*?)-- ============================================\s*-- COMPLETION MESSAGE/s
    );

    if (blogSeederMatch) {
      let blogSQL = blogSeederMatch[1];
      // Remove SET FOREIGN_KEY_CHECKS statements (already handled)
      blogSQL = blogSQL
        .replace(/SET FOREIGN_KEY_CHECKS\s*=\s*[01];/gi, "")
        .trim();

      if (blogSQL.length > 0) {
        // Execute blog SQL
        console.log("📝 Executing blog SQL statements...");
        try {
          await connection.query(blogSQL);
          console.log("✅ Blog data inserted successfully!");
        } catch (sqlError) {
          console.error("❌ Error executing blog SQL:", sqlError.message);
          // Try to execute statement by statement for better error handling
          console.log("⚠️  Trying to execute statement by statement...");
          const statements = blogSQL
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith("--"));

          let successCount = 0;
          for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement || statement.match(/^--/)) continue;

            try {
              await connection.query(statement + ";");
              successCount++;
            } catch (err) {
              // Ignore duplicate key errors
              if (
                err.code === "ER_DUP_ENTRY" ||
                err.message.includes("Duplicate")
              ) {
                successCount++;
                continue;
              }
              console.error(
                `⚠️  Error in statement ${i + 1}: ${err.message.substring(
                  0,
                  100
                )}`
              );
            }
          }
          console.log(
            `✅ Executed ${successCount}/${statements.length} statements successfully`
          );
        }
      } else {
        console.warn("⚠️  Blog SQL is empty");
      }
    } else {
      console.warn("⚠️  Blog seeder section not found in SQL file");
    }

    // Verify
    const [categoriesCount] = await connection.query(
      "SELECT COUNT(*) as count FROM blog_categories"
    );
    const [postsCount] = await connection.query(
      "SELECT COUNT(*) as count FROM blog_posts"
    );
    const [commentsCount] = await connection.query(
      "SELECT COUNT(*) as count FROM blog_comments"
    );

    console.log("\n📊 Verification:");
    console.log(`  • Blog Categories: ${categoriesCount[0].count}`);
    console.log(`  • Blog Posts: ${postsCount[0].count}`);
    console.log(`  • Blog Comments: ${commentsCount[0].count}`);
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.sql) {
      console.error("SQL:", error.sql.substring(0, 200));
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

main();
