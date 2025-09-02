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
  ssl: {
    ca: fs.readFileSync('./ssl/isrgrootx1.pem')
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Vezmi jedno spojenie a over, že sa vie pripojiť (len na log)
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Chyba pripojenia k databáze:', err);
  } else {
    console.log('Pripojený k databáze cez SSL (pool)');
    connection.release(); // vrátime spojenie späť do poolu
  }
});

// Promisify db.query pre async/await
const db = pool.promise();

// Pre zachovanie starého spôsobu (callback) môžeme nastaviť:
db.queryCallback = util.promisify((sql, params, callback) => {
  pool.query(sql, params, callback);
});

module.exports = db;
