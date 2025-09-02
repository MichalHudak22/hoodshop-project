const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,     
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_NAME   
});

db.connect(err => {
  if (err) {
    console.error('Chyba pripojenia:', err);
  } else {
    console.log('Pripojený k databáze');
  }
});

// Promisify db.query, aby sme mohli použiť await
db.query = util.promisify(db.query);

module.exports = db;
