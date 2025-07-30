const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Chyba pripojenia:', err);
  } else {
    console.log('Pripojený k databáze');
    connection.release();
  }
});

// Promisify query
pool.query = util.promisify(pool.query);

module.exports = pool;
