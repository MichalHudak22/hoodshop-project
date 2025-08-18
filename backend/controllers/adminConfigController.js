const db = require('../database');

// ------------------ Ziskat ceny DPD GLS a SLovak Post ------------------
exports.getShippingPrices = async (req, res) => {
  try {
    const rows = await db.query('SELECT name, price FROM admin_config');

    res.json(rows);
  } catch (err) {
    console.error('Chyba pri načítaní cien dopravy:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ------------------ Upravit ceny DPD GLS a Slovak Post ------------------
exports.updateShippingPrice = async (req, res) => {
  const { name, price } = req.body;

  console.log('Received request body:', req.body); // debug

  // Overenie mena dopravy (case-insensitive)
  const allowedNames = ['DPD', 'GLS', 'Slovak Post'];
  const matchedName = allowedNames.find(n => n.toLowerCase() === name.toLowerCase());
  if (!matchedName) {
    return res.status(400).json({ error: 'Neplatné meno dopravy' });
  }

  // Parsovanie ceny na číslo
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice)) {
    return res.status(400).json({ error: 'Cena musí byť číslo' });
  }

  try {
    // Update v DB
    const [result] = await db.query(
      'UPDATE admin_config SET price = ? WHERE name = ?',
      [numericPrice, matchedName]
    );

    console.log('Update result:', result); // debug

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cenu sa nepodarilo aktualizovať. Skontrolujte meno dopravy.' });
    }

    res.json({ success: true });
  } catch (err) {
  console.error('Chyba pri aktualizácii ceny:', err); // full error do konzoly
  res.status(500).json({ error: err.message });       // pošli presnú správu aj do frontendu
}

};



    // ------------------ Admin_Change_Title ------------------

// GET: Načítanie textu podľa sekcie
exports.getSectionContent = async (req, res) => {
  const { key } = req.params;
  try {
    const rows = await db.query(
      'SELECT title, paragraph FROM admin_change_title WHERE section_key = ?',
      [key]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sekcia neexistuje' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Chyba pri načítaní textu:', error);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};

// POST: Vytvorenie alebo úprava textu pre sekciu
exports.updateSectionContent = async (req, res) => {
  const { section_key, title, paragraph } = req.body;

  if (!section_key || !title || !paragraph) {
    return res.status(400).json({ error: 'Chýbajú dáta v tele požiadavky' });
  }

  try {
    const rows = await db.query(
      'SELECT id FROM admin_change_title WHERE section_key = ?',
      [section_key]
    );

    if (rows.length > 0) {
      // UPDATE
      await db.query(
        'UPDATE admin_change_title SET title = ?, paragraph = ? WHERE section_key = ?',
        [title, paragraph, section_key]
      );
    } else {
      // INSERT
      await db.query(
        'INSERT INTO admin_change_title (section_key, title, paragraph) VALUES (?, ?, ?)',
        [section_key, title, paragraph]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Chyba pri ukladaní textu:', error);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};
