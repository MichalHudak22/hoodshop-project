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

  // Overenie mena dopravy
  const allowedNames = ['DPD', 'GLS', 'Slovak Post'];
  if (!allowedNames.includes(name)) {
    return res.status(400).json({ error: 'Neplatné meno dopravy' });
  }

  try {
    // Vykonanie update a získanie výsledku
    const [result] = await db.query(
      'UPDATE admin_config SET price = ? WHERE name = ?',
      [price, name]
    );

    console.log('Update result:', result); // pre debug: affectedRows, changedRows

    // Ak sa nič nezmenilo (napr. meno neexistuje)
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cenu sa nepodarilo aktualizovať. Skontrolujte meno dopravy.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Chyba pri aktualizácii ceny:', err);
    res.status(500).json({ error: 'Server error' });
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
