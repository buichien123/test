const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecommerce_db",
  multipleStatements: true,
};

const usersData = [
  [
    "admin",
    "admin@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Quản trị viên",
    "0901234567",
    "123 Đường ABC, Quận 1, TP.HCM",
    "admin",
  ],
  [
    "customer1",
    "customer1@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Nguyễn Văn A",
    "0901111111",
    "456 Đường XYZ, Quận 2, TP.HCM",
    "customer",
  ],
  [
    "customer2",
    "customer2@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Trần Thị B",
    "0902222222",
    "789 Đường DEF, Quận 3, TP.HCM",
    "customer",
  ],
  [
    "customer3",
    "customer3@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Lê Văn C",
    "0903333333",
    "321 Đường GHI, Quận 4, TP.HCM",
    "customer",
  ],
  [
    "customer4",
    "customer4@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Phạm Thị D",
    "0904444444",
    "654 Đường JKL, Quận 5, TP.HCM",
    "customer",
  ],
  [
    "customer5",
    "customer5@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Hoàng Văn E",
    "0905555555",
    "111 Đường MNO, Quận 6, TP.HCM",
    "customer",
  ],
  [
    "customer6",
    "customer6@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Vũ Thị F",
    "0906666666",
    "222 Đường PQR, Quận 7, TP.HCM",
    "customer",
  ],
  [
    "customer7",
    "customer7@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Đỗ Văn G",
    "0907777777",
    "333 Đường STU, Quận 8, TP.HCM",
    "customer",
  ],
  [
    "customer8",
    "customer8@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Bùi Thị H",
    "0908888888",
    "444 Đường VWX, Quận 9, TP.HCM",
    "customer",
  ],
  [
    "customer9",
    "customer9@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Lý Văn I",
    "0909999999",
    "555 Đường YZA, Quận 10, TP.HCM",
    "customer",
  ],
  [
    "customer10",
    "customer10@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Đinh Thị K",
    "0910000000",
    "666 Đường BCD, Quận 11, TP.HCM",
    "customer",
  ],
  [
    "customer11",
    "customer11@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Trương Văn L",
    "0911111111",
    "777 Đường EFG, Quận 12, TP.HCM",
    "customer",
  ],
  [
    "customer12",
    "customer12@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Phan Thị M",
    "0912222222",
    "888 Đường HIJ, Quận Bình Thạnh, TP.HCM",
    "customer",
  ],
  [
    "customer13",
    "customer13@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Võ Văn N",
    "0913333333",
    "999 Đường KLM, Quận Tân Bình, TP.HCM",
    "customer",
  ],
  [
    "customer14",
    "customer14@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Dương Thị O",
    "0914444444",
    "101 Đường NOP, Quận Phú Nhuận, TP.HCM",
    "customer",
  ],
  [
    "customer15",
    "customer15@example.com",
    "$2a$10$ksSnXYX7DjEJZ1TG3HPl2eWbfj2ouoBPdBWU4StdCOhk3vxAllr5W",
    "Ngô Văn P",
    "0915555555",
    "202 Đường QRS, Quận Gò Vấp, TP.HCM",
    "customer",
  ],
];

const categoriesData = [
  [
    "Điện thoại",
    "Các loại điện thoại thông minh",
    "https://picsum.photos/400/400?random=1",
  ],
  ["Laptop", "Máy tính xách tay", "https://picsum.photos/400/400?random=2"],
  ["Tablet", "Máy tính bảng", "https://picsum.photos/400/400?random=3"],
  ["Phụ kiện", "Phụ kiện điện tử", "https://picsum.photos/400/400?random=4"],
  [
    "Đồng hồ thông minh",
    "Smartwatch và đồng hồ thông minh",
    "https://picsum.photos/400/400?random=5",
  ],
  [
    "Tai nghe",
    "Tai nghe không dây và có dây",
    "https://picsum.photos/400/400?random=6",
  ],
];

const main = async () => {
  let connection;

  try {
    console.log("\n" + "=".repeat(50));
    console.log("  INSERT USERS AND CATEGORIES DATA");
    console.log("=".repeat(50) + "\n");

    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database:", dbConfig.database);

    // Insert users
    console.log("\n📝 Inserting users...");
    const usersQuery = `INSERT INTO users (username, email, password, full_name, phone, address, role) VALUES ? 
                       ON DUPLICATE KEY UPDATE username=username`;
    await connection.query(usersQuery, [usersData]);
    console.log(`✅ Inserted ${usersData.length} users`);

    // Insert categories
    console.log("\n📝 Inserting categories...");
    const categoriesQuery = `INSERT INTO categories (name, description, image_url) VALUES ? 
                            ON DUPLICATE KEY UPDATE name=name`;
    await connection.query(categoriesQuery, [categoriesData]);
    console.log(`✅ Inserted ${categoriesData.length} categories`);

    // Verify
    const [usersCount] = await connection.query(
      "SELECT COUNT(*) as count FROM users"
    );
    const [categoriesCount] = await connection.query(
      "SELECT COUNT(*) as count FROM categories"
    );

    console.log("\n📊 Verification:");
    console.log(`  • Users: ${usersCount[0].count}`);
    console.log(`  • Categories: ${categoriesCount[0].count}`);
    console.log("\n✅ Done!");
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
