const mysql = require('mysql2');
const util = require('util');
const fs = require('fs');
require('dotenv').config();

// Vytvorenie poolu
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // môžeš upraviť podľa potreby
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync('./ssl/isrgrootx1.pem')
  }
});

// Promisify pool.query, aby sme mohli používať await
pool.query = util.promisify(pool.query);

// Ak chceš priamo získavať connection (napr. pre transakcie)
pool.getConnectionAsync = util.promisify(pool.getConnection);

module.exports = pool;
