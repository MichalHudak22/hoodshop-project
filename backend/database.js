const mysql = require('mysql2');
const util = require('util');
const fs = require('fs');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync('./ssl/isrgrootx1.pem')
  }
});

db.connect(err => {
  if (err) {
    console.error('Chyba pripojenia:', err);
  } else {
    console.log('Pripojený k databáze cez SSL');
  }
});

// Promisify db.query, aby sme mohli použiť await
db.query = util.promisify(db.query);

module.exports = db;
