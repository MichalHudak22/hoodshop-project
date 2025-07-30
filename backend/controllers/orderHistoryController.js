// controllers/orderHistoryController.js
const db = require('../database');

const getUserOrders = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Neautorizovaný prístup' });
  }

  try {
    // Bez destructuringu, výsledok je priamo pole riadkov
    const orders = await db.query(
  `SELECT id, order_number, created_at, full_name, profile_email, address, city, postal_code, mobile_number, payment_method, delivery_method, delivery_price, total_price, used_points FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
  [userId]
);


    for (const order of orders) {
      const items = await db.query(
        `SELECT oi.*, p.name as product_name
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Chyba pri načítaní objednávok:', err);
    res.status(500).json({ error: 'Chyba servera' });
  }
};

const getOrdersByUserIdForAdmin = async (req, res) => {
  const user = req.user;
  const targetUserId = req.params.userId;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Prístup zamietnutý. Iba pre adminov.' });
  }

  try {
    const rows = await db.query(`
      SELECT 
        o.id AS order_id,
        o.order_number,
        o.user_id,
        o.full_name,
        o.profile_email,
        o.address,
        o.city,
        o.postal_code,
        o.mobile_number,
        o.payment_method,
        o.delivery_method,
        o.delivery_price,  
        o.total_price,
        o.created_at,
        o.used_points,
        oi.product_id,
        oi.quantity,
        oi.price AS item_price,
        p.name AS product_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [targetUserId]);

    // Skupina objednávok podľa order_id
    const ordersMap = new Map();

    for (const row of rows) {
      const orderId = row.order_id;

      if (!ordersMap.has(orderId)) {
       ordersMap.set(orderId, {
        id: orderId,
        order_number: row.order_number,
        user_id: row.user_id,
        full_name: row.full_name,
        profile_email: row.profile_email,
        address: row.address,
        city: row.city,
        postal_code: row.postal_code,
        mobile_number: row.mobile_number,
        payment_method: row.payment_method,
        delivery_method: row.delivery_method,  
        delivery_price: row.delivery_price, 
        total_price: row.total_price,
        created_at: row.created_at,
        used_points: row.used_points,
        items: [],
      });
      }

      // Pridaj produkt do "items" zoznamu
      ordersMap.get(orderId).items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.item_price,
      });
    }

    const groupedOrders = Array.from(ordersMap.values());

    res.json(groupedOrders);
  } catch (err) {
    console.error('Chyba pri načítaní objednávok adminom:', err);
    res.status(500).json({ error: 'Chyba servera' });
  }
};


module.exports = { getUserOrders, getOrdersByUserIdForAdmin };
