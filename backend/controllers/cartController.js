const db = require('../database');

// ========================
// Pridanie produktu do košíka
// ========================
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Neplatné údaje produktu alebo množstva' });
  }

  try {
    let checkQuery = '';
    let checkParams = [];

    if (userId) {
      checkQuery = 'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?';
      checkParams = [userId, productId];
    } else {
      checkQuery = 'SELECT id, quantity FROM cart_items WHERE session_id = ? AND product_id = ?';
      checkParams = [sessionId, productId];
    }

    const [results] = await db.query(checkQuery, checkParams);

    if (results.length > 0) {
      // Produkt už existuje, zvýš množstvo
      const cartItemId = results[0].id;
      const newQuantity = results[0].quantity + quantity;

      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, cartItemId]);
      res.status(200).json({ message: 'Množstvo produktu aktualizované v košíku' });
    } else {
      // Produkt nie je v košíku, vlož nový záznam
      await db.query(
        'INSERT INTO cart_items (user_id, session_id, product_id, quantity) VALUES (?, ?, ?, ?)',
        [userId, sessionId, productId, quantity]
      );
      res.status(201).json({ message: 'Produkt pridaný do košíka' });
    }
  } catch (err) {
    console.error('Chyba pri pridávaní do košíka:', err);
    res.status(500).json({ error: 'Chyba servera pri pridávaní do košíka' });
  }
};



// ========================
// Získanie obsahu košíka
// ========================
const getCart = async (req, res) => {
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  let query;
  let params;

  if (userId && sessionId) {
    query = `
      SELECT cart_items.id AS cart_item_id, cart_items.quantity, products.id AS product_id,
             products.name, products.price, products.image
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ? OR cart_items.session_id = ?
    `;
    params = [userId, sessionId];
  } else if (userId) {
    query = `
      SELECT cart_items.id AS cart_item_id, cart_items.quantity, products.id AS product_id,
             products.name, products.price, products.image
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ?
    `;
    params = [userId];
  } else {
    query = `
      SELECT cart_items.id AS cart_item_id, cart_items.quantity, products.id AS product_id,
             products.name, products.price, products.image
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.session_id = ?
    `;
    params = [sessionId];
  }

  try {
    const [results] = await db.query(query, params);

    const formattedResults = results.map(item => ({
      id: item.cart_item_id,
      quantity: item.quantity,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      image: item.image,
    }));

    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Chyba pri načítaní košíka:', err);
    res.status(500).json({ error: 'Chyba pri načítaní košíka' });
  }
};


// ========================
// Odstránenie položky z košíka
// ========================
const removeFromCart = async (req, res) => {
  const { id } = req.params; // ID položky v košíku (cart_item_id)
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  const query = 'DELETE FROM cart_items WHERE id = ? AND (user_id = ? OR session_id = ?)';

  try {
    const [result] = await db.query(query, [id, userId, sessionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Položka nebola nájdená alebo nemáte oprávnenie ju odstrániť' });
    }

    res.status(200).json({ message: 'Položka odstránená' });
  } catch (err) {
    console.error('Chyba pri odstraňovaní položky:', err);
    res.status(500).json({ error: 'Chyba pri odstraňovaní položky' });
  }
};

// ========================
// Aktualizácia množstva položky v košíku
// ========================
const updateCartItem = async (req, res) => {
  const cartItemId = req.params.id; // ID položky v košíku
  const { quantity } = req.body;
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Neplatné množstvo' });
  }

  const query = 'UPDATE cart_items SET quantity = ? WHERE id = ? AND (user_id = ? OR session_id = ?)';

  try {
    const [result] = await db.query(query, [quantity, cartItemId, userId, sessionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Položka nebola nájdená alebo nemáte oprávnenie ju upraviť' });
    }

    res.status(200).json({ message: 'Množstvo úspešne aktualizované' });
  } catch (err) {
    console.error('Chyba pri aktualizácii položky:', err);
    res.status(500).json({ error: 'Chyba pri aktualizácii položky' });
  }
};

// ========================
// Získanie počtu položiek v košíku (pre badge)
// ========================
const getCartCount = async (req, res) => {
  const userId = req.userId || null;
  const sessionId = req.headers["x-session-id"] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: "Chýba identifikácia používateľa" });
  }

  let query = "";
  let params = [];

  if (userId && sessionId) {
    query = "SELECT SUM(quantity) AS count FROM cart_items WHERE user_id = ? OR session_id = ?";
    params = [userId, sessionId];
  } else if (userId) {
    query = "SELECT SUM(quantity) AS count FROM cart_items WHERE user_id = ?";
    params = [userId];
  } else {
    query = "SELECT SUM(quantity) AS count FROM cart_items WHERE session_id = ?";
    params = [sessionId];
  }

  try {
    const [rows] = await db.query(query, params);
    const count = rows[0]?.count || 0;
    res.status(200).json({ count });
  } catch (err) {
    console.error("DB error getCartCount:", err);
    res.status(500).json({ error: "Chyba pri načítaní počtu položiek" });
  }
};



// ========================
// Vymazanie celého košíka (po dokončení objednávky)
// ========================
const clearCart = async (req, res) => {
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  let query = '';
  let params = [];

  if (userId && sessionId) {
    query = 'DELETE FROM cart_items WHERE user_id = ? OR session_id = ?';
    params = [userId, sessionId];
  } else if (userId) {
    query = 'DELETE FROM cart_items WHERE user_id = ?';
    params = [userId];
  } else {
    query = 'DELETE FROM cart_items WHERE session_id = ?';
    params = [sessionId];
  }

  try {
    const [result] = await db.query(query, params);
    res.status(200).json({ message: 'Košík úspešne vymazaný' });
  } catch (err) {
    console.error('DB error clearCart:', err);
    res.status(500).json({ error: 'Chyba pri mazaní košíka' });
  }
};


// Export funkcií pre použitie v route súbore
module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  getCartCount,
  clearCart,
};
