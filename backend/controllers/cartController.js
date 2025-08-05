const db = require('../database');

// ========================
// Pridanie produktu do košíka
// ========================
const addToCart = (req, res) => {

  const { productId, quantity } = req.body;
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Neplatné údaje produktu alebo množstva' });
  }

  // Najprv zisti, či už produkt v košíku je
  let checkQuery = '';
  let checkParams = [];

  if (userId) {
    checkQuery = 'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?';
    checkParams = [userId, productId];
  } else {
    checkQuery = 'SELECT id, quantity FROM cart_items WHERE session_id = ? AND product_id = ?';
    checkParams = [sessionId, productId];
  }

  db.query(checkQuery, checkParams, (err, results) => {
    if (err) return res.status(500).json({ error: 'Chyba pri kontrole košíka' });

    if (results.length > 0) {
      // Produkt už existuje, zvýš množstvo
      const cartItemId = results[0].id;
      const newQuantity = results[0].quantity + quantity;

      const updateQuery = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
      db.query(updateQuery, [newQuantity, cartItemId], (err2) => {
        if (err2) return res.status(500).json({ error: 'Chyba pri aktualizácii množstva v košíku' });
        res.status(200).json({ message: 'Množstvo produktu aktualizované v košíku' });
      });
    } else {
      // Produkt nie je v košíku, vlož nový záznam
      const insertQuery = 'INSERT INTO cart_items (user_id, session_id, product_id, quantity) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [userId, sessionId, productId, quantity], (err3) => {
        if (err3) return res.status(500).json({ error: 'Chyba pri pridávaní do košíka' });
        res.status(201).json({ message: 'Produkt pridaný do košíka' });
      });
    }
  });
};


// ========================
// Získanie obsahu košíka
// ========================
const getCart = (req, res) => {
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  let query;
  let params;

  // Ak sú k dispozícii obe identifikácie (zvyčajne počas prechodu z neprihláseného stavu na prihlásený)
  if (userId && sessionId) {
    query = `
     SELECT cart_items.id AS cart_item_id, cart_items.quantity, products.id AS product_id, products.name, products.price, products.image
     FROM cart_items
     JOIN products ON cart_items.product_id = products.id
     WHERE cart_items.user_id = ? OR cart_items.session_id = ?

    `;
    params = [userId, sessionId];
  } else if (userId) {
    query = `
      SELECT cart_items.id AS cart_item_id, cart_items.quantity, products.id AS product_id, products.name, products.price, products.image
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ?

    `;
    params = [userId];
  } else {
    query = `
      SELECT cart_items.id AS cart_item_id, cart_items.quantity, products.id AS product_id, products.name, products.price, products.image
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.session_id = ?
    `;
    params = [sessionId];
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Chyba pri načítaní košíka' });

    // Výsledky sa formátujú pre frontend (zmena `cart_item_id` na `id`)
    const formattedResults = results.map(item => ({
      id: item.cart_item_id, // ID položky v košíku
      quantity: item.quantity, // Množstvo
      product_id: item.product_id, // ID produktu
      name: item.name, // Názov produktu
      price: item.price, // Cena
      image: item.image, // Obrázok
    }));

    res.status(200).json(formattedResults);
  });
};

// ========================
// Odstránenie položky z košíka
// ========================
const removeFromCart = (req, res) => {
  const { id } = req.params; // ID položky v košíku (cart_item_id)
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;

  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  const query = 'DELETE FROM cart_items WHERE id = ? AND (user_id = ? OR session_id = ?)';
  db.query(query, [id, userId, sessionId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Chyba pri odstraňovaní položky' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Položka nebola nájdená alebo nemáte oprávnenie ju odstrániť' });
    }

    res.status(200).json({ message: 'Položka odstránená' });
  });
};

// ========================
// Aktualizácia množstva položky v košíku
// ========================
const updateCartItem = (req, res) => {
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
  db.query(query, [quantity, cartItemId, userId, sessionId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Chyba pri aktualizácii položky' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Položka nebola nájdená alebo nemáte oprávnenie ju upraviť' });
    }

    res.status(200).json({ message: 'Množstvo úspešne aktualizované' });
  });
};

// ========================
// Získanie počtu položiek v košíku (pre badge)
// ========================
const getCartCount = (req, res) => {
  const userId = req.userId || null;
  const sessionId = req.headers['x-session-id'] || null;
  
console.log('📦 [GET /cart/count] Called');
  console.log('🔐 userId:', userId);
  console.log('🌀 sessionId:', sessionId);
  
  if (!userId && !sessionId) {
    return res.status(400).json({ error: 'Chýba identifikácia používateľa' });
  }

  let query = '';
  let params = [];

  if (userId && sessionId) {
    // Počíta počet všetkých položiek pre používateľa alebo session
    query = 'SELECT SUM(quantity) AS count FROM cart_items WHERE user_id = ? OR session_id = ?';
    params = [userId, sessionId];
  } else if (userId) {
    query = 'SELECT SUM(quantity) AS count FROM cart_items WHERE user_id = ?';
    params = [userId];
  } else {
    query = 'SELECT SUM(quantity) AS count FROM cart_items WHERE session_id = ?';
    params = [sessionId];
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Chyba pri načítaní počtu položiek' });

    const count = results[0].count || 0;
    res.status(200).json({ count });
  });
};


// ========================
// Vymazanie celého košíka (po dokončení objednávky)
// ========================
const clearCart = (req, res) => {
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

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'Chyba pri mazaní košíka' });

    res.status(200).json({ message: 'Košík úspešne vymazaný' });
  });
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
