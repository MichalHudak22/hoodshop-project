// db.js
const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync("./ssl/isrgrootx1.pem")
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// test spojenia
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ Pripojený k databáze cez SSL (pool)");
    conn.release();
  } catch (err) {
    console.error("❌ Chyba pripojenia:", err);
  }
})();

module.exports = db;
