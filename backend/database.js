const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,          // mainline.proxy.rlwy.net
  port: Number(process.env.DB_PORT),  // 20728
  user: process.env.DB_USER,          // root
  password: process.env.DB_PASSWORD,  // heslo
  database: process.env.DB_NAME,      // railway
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Chyba pripojenia k databáze:', err);
  } else {
    console.log('✅ Pripojený k databáze');
    connection.release();
  }
});

pool.query = util.promisify(pool.query);

module.exports = pool;
