const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync('./ssl/isrgrootx1.pem')
  },
  waitForConnections: true,
  connectionLimit: 10,  // počet súčasných spojení
  queueLimit: 0          // neobmedzená čakacia fronta
});

// Promisify pre použitie s async/await
const db = pool.promise();

module.exports = db;
