const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');  // import fs

const pool = require('./database');  // TU naimportuj pool
console.log('pool object:', pool);

const userRoutes = require('./routes/userRoutes');     
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const orderHistoryRoutes = require('./routes/orderHistoryRoutes');
const brandsRoutes = require('./routes/brandsRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // 💥 Toto ti chýba!
const adminConfigRoutes = require('./routes/adminConfigRoutes');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

// Pripojenie admin config routes
app.use('/api/config', adminConfigRoutes);

// Sprístupnenie obrázkov zo `src/img/`
app.use('/img', express.static(path.join(__dirname, 'src/img')));

// Sprístupnenie videí zo `src/video/`
app.use('/video', express.static(path.join(__dirname, 'src/video')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/user/upload', uploadRoutes);  // => /user/upload/photo

// Sprístupnenie vsetkych znaciek
app.use('/api/brands', brandsRoutes);

// Debug: vypíšeme absolútnu cestu a súbory vo video priečinku
const videoPath = path.join(__dirname, 'src/video');

fs.readdir(videoPath, (err, files) => {
  if (err) {
    console.error('Chyba pri čítaní priečinka videí:', err);
  } else {
    console.log('Súbory vo video priečinku:', files);
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Vitaj na serveri!');
});

// Endpointy
app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-history', orderHistoryRoutes);


app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ dbWorks: true, result: rows[0] });
  } catch (error) {
    console.error('❌ DB test error:', error);
    res.status(500).json({ dbWorks: false, error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server beží na porte ${PORT}`);
});

