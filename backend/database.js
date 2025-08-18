const mysql = require('mysql2');
const util = require('util');
const fs = require('fs');             // <-- pridaj
const path = require('path');         // <-- pridaj
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,       // gateway TiDB
  port: Number(process.env.DB_PORT), 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, 'ssl', 'isrgrootx1.pem'))  // cesta k certu
  }
});

// Promisify pre async/await
pool.query = util.promisify(pool.query);

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Chyba pripojenia k TiDB:', err);
  } else {
    console.log('✅ Pripojený k TiDB');
    connection.release();
  }
});

module.exports = pool;
