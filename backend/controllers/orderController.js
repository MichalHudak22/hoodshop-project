const db = require('../database');

// Funkcia na vygenerovanie unikátneho čísla objednávky
const generateOrderNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const randomPart = Math.floor(1000 + Math.random() * 9000); // náhodné 4-miestne číslo
  return `${datePart}${randomPart}`;
};

const placeOrder = async (req, res) => {
  const {
   full_name,
  profile_email,
  address,
  city,
  postal_code,
  mobile_number,
  payment_method,
  delivery_method,
  delivery_price, 
  total_price,
  cartItems,
  usedPoints,
} = req.body;

  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  try {
    const orderNumber = generateOrderNumber();

   const orderResult = await db.query(
  `INSERT INTO orders 
  (user_id, session_id, full_name, profile_email, address, city, postal_code, mobile_number, payment_method, delivery_method, delivery_price, total_price, used_points, order_number)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    userId,
    sessionId,
    full_name,
    profile_email,
    address,
    city,
    postal_code,
    mobile_number,
    payment_method,
    delivery_method,
    delivery_price,
    total_price,  
    usedPoints,
    orderNumber
  ]
);

    const orderId = orderResult.insertId;

    // ✅ 2. Vloženie položiek objednávky
    for (const item of cartItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // ✅ 3. Práca s vernostnými bodmi (iba pre prihlásených používateľov)
    if (userId) {
      const earnedPoints = total_price * 0.05 * 10;

      await db.query(
        `UPDATE user SET loyalty_points = loyalty_points + ? - ? WHERE id = ?`,
        [earnedPoints, usedPoints, userId]
      );
    }

    // ✅ 4. Odpoveď
    res.status(201).json({
      message: 'Order placed successfully!',
      orderNumber,
    });

  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ message: 'Error placing order.' });
  }
};


// ------------------ Ziskat vsetky objednavky------------------
const getAllOrders = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Prístup zamietnutý' });
  }

  try {
    // Dotaz, ktorý z tabuľky orders pridá aj email užívateľa z user
    const orders = await db.query(`
      SELECT 
        o.id, o.user_id, o.session_id, o.full_name, o.profile_email, o.address,
        o.payment_method, o.total_price, o.created_at, o.used_points,
        o.order_number, o.city, o.postal_code, o.delivery_method, o.delivery_price,
        u.email AS user_email  -- pridáme email užívateľa
      FROM orders o
      LEFT JOIN user u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    console.log('Orders fetched from DB:', orders);
console.log(Array.isArray(orders), orders.length);
      console.log('Orders fetched from DB:', orders.length);
  if (orders.length > 0) {
    console.log('First order example:', orders[0]);
  } else {
    console.log('No orders found in database.');
  }

    // Pre každú objednávku načítame položky
    for (const order of orders) {
      const items = await db.query(`
        SELECT 
          oi.product_id, 
          oi.quantity, 
          oi.price AS item_price,
          p.name AS product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      

      order.items = items;
    }

    // Pošleme objednávky klientovi
    res.json(orders);
  } catch (err) {
    console.error('Chyba pri získavaní všetkých objednávok:', err);
    res.status(500).json({ error: 'Chyba databázy pri načítaní objednávok' });
  }
};


// ----------------  --------------------
const getOrdersSummary = (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Prístup zamietnutý' });
  }

  const sql = `
    SELECT 
      COUNT(*) AS totalOrders, 
      SUM(total_price) AS totalRevenue,
      SUM(used_points) AS totalUsedPoints
    FROM orders
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Chyba pri získavaní sumára objednávok:', err);
      return res.status(500).json({ error: 'Chyba databázy' });
    }

    const summary = results[0];
    res.json({
      totalOrders: summary.totalOrders || 0,
      totalRevenue: summary.totalRevenue || 0,
      totalUsedPoints: summary.totalUsedPoints || 0,
    });
  });
};
// --------------------  ----------------
const getTopProducts = async (req, res) => {
  // Odstráň kontrolu na admina
  try {
    const [rows] = await db.query(`
      SELECT 
        p.name AS name,
        SUM(oi.quantity) AS quantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY oi.product_id
      ORDER BY quantity DESC
      LIMIT 10
    `);

    res.json(rows);

  } catch (err) {
    console.error('Chyba pri získavaní top produktov:', err);
    res.status(500).json({ error: 'Chyba databázy pri získavaní najpredávanejších produktov.' });
  }
};


module.exports = { placeOrder, getAllOrders, getOrdersSummary, getTopProducts };


