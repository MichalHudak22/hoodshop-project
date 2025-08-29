const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const pool = require('./database');  

// Routes
const userRoutes = require('./routes/userRoutes');     
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes'); 
const orderHistoryRoutes = require('./routes/orderHistoryRoutes');
const brandsRoutes = require('./routes/brandsRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); 
const adminConfigRoutes = require('./routes/adminConfigRoutes');

const app = express();

// Render / Heroku proxy fix
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/config', adminConfigRoutes);
app.use('/user/upload', uploadRoutes);  // => /user/upload/photo
app.use('/api/brands', brandsRoutes);
app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-history', orderHistoryRoutes);

// Static files
app.use('/img', express.static(path.join(__dirname, 'src/img')));
app.use('/video', express.static(path.join(__dirname, 'src/video')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Vitaj na serveri!');
});

// DB test endpoint
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
  console.log(`✅ Server beží na porte ${PORT}`);
});
