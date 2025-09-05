const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const pool = require('../database'); // predpokladám, že tu máš pool (mysql2/promise)

require('dotenv').config();

// Nodemailer konfigurácia
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------------------------
// Získanie všetkých používateľov
// ---------------------------
const getUsers = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT id, name, email, role FROM user');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};

// ---------------------------
// Vytvorenie nového používateľa (registrácia)
// ---------------------------
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existingUsers] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUsers.length > 0) return res.status(400).json({ error: 'Email je už zaregistrovaný.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await pool.query(
      'INSERT INTO user (name, email, password, is_verified) VALUES (?, ?, ?, false)',
      [name, email, hashedPassword]
    );

    const userId = insertResult.insertId;
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAtFormatted]
    );

    const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Overenie emailu',
      html: `
        <p>Ahoj ${name},</p>
        <p>Prosím, over svoj účet kliknutím na odkaz nižšie:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>Ak si sa neregistroval, ignoruj tento email.</p>
      `,
    });

    res.status(201).json({ message: 'Registrácia úspešná. Skontroluj email pre overenie účtu.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba pri registrácii používateľa.' });
  }
};

// ---------------------------
// Overenie emailu
// ---------------------------
const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: 'Token chýba' });

    const [tokens] = await pool.query('SELECT * FROM email_verification_tokens WHERE token = ?', [token]);
    if (tokens.length === 0) return res.status(400).json({ error: 'Token neplatný alebo už použitý' });

    const tokenData = tokens[0];
    if (new Date() > new Date(tokenData.expires_at)) return res.status(400).json({ error: 'Token expiroval' });

    const userId = tokenData.user_id;
    await pool.query('UPDATE user SET is_verified = true WHERE id = ?', [userId]);
    await pool.query('DELETE FROM email_verification_tokens WHERE user_id = ?', [userId]);

    res.status(200).json({ message: 'Email úspešne overený' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba pri overovaní emailu.' });
  }
};

// ---------------------------
// Prihlásenie používateľa
// ---------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ error: 'Používateľ s týmto emailom neexistuje.' });

    const user = users[0];
    if (user.is_verified === 0) return res.status(403).json({ error: 'Email nie je overený. Skontroluj svoj email.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Nesprávne heslo.' });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '6h' });

    res.status(200).json({
      message: 'Prihlásenie úspešné',
      token,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba pri prihlasovaní.' });
  }
};

// ---------------------------
// Získanie profilu prihláseného používateľa
// ---------------------------
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [results] = await pool.query(
      `SELECT name, email, profile_email, birth_date, mobile_number, address, city, postal_code, loyalty_points, user_photo, role 
       FROM user WHERE id = ?`,
      [userId]
    );

    if (results.length === 0) return res.status(404).json({ error: 'Používateľ neexistuje' });

    res.status(200).json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba pri načítavaní údajov používateľa.' });
  }
};


// ---------------------------
// Aktualizácia profilu používateľa
// ---------------------------
const updateUserProfile = async (req, res) => {
  const userId = req.user?.userId;
  const fieldsToUpdate = req.body;

  if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ error: 'Nič na aktualizáciu' });
  }

  const allowedFields = ['name', 'email', 'profile_email', 'birth_date', 'mobile_number', 'address', 'city', 'postal_code'];
  const filteredFields = {};

  for (const key in fieldsToUpdate) {
    if (allowedFields.includes(key)) {
      filteredFields[key] = fieldsToUpdate[key];
    }
  }

  if (Object.keys(filteredFields).length === 0) {
    return res.status(400).json({ error: 'Žiadne platné polia na aktualizáciu' });
  }

  // formátovanie birth_date
  if (filteredFields.birth_date) {
    const date = new Date(filteredFields.birth_date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Neplatný formát dátumu narodenia' });
    }
    filteredFields.birth_date = date.toISOString().split('T')[0];
  }

  const setClause = [];
  const values = [];

  Object.entries(filteredFields).forEach(([key, value]) => {
    setClause.push(`${key} = ?`);
    values.push(value);
  });

  values.push(userId);

  const sql = `UPDATE user SET ${setClause.join(', ')} WHERE id = ?`;

  try {
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Používateľ nebol nájdený' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, profile_email, birth_date, mobile_number, address, city, postal_code FROM user WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Používateľ neexistuje' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chyba pri aktualizácii profilu' });
  }
};

// ---------------------------
// Zmazanie účtu používateľa
// ---------------------------
const deleteUserAccount = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Neautorizovaný prístup' });

  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM user WHERE id = ?', [userId]);

    res.json({ success: true, message: 'Účet bol úspešne zmazaný' });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Chyba pri mazani účtu' });
  }
};

// ---------------------------
// ADMIN - získať používateľa podľa ID
// ---------------------------
const getUserById = async (req, res) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) return res.status(400).json({ error: 'Neplatné ID používateľa' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Nie ste admin' });

  try {
    const [result] = await pool.query(
      'SELECT id, name, email, profile_email, birth_date, mobile_number, address, city, postal_code FROM user WHERE id = ?',
      [userId]
    );

    if (result.length === 0) return res.status(404).json({ error: 'Používateľ neexistuje' });

    res.json(result[0]);
  } catch (err) {
    console.error('Chyba DB pri načítaní používateľa:', err);
    res.status(500).json({ error: 'Chyba pri načítaní používateľa' });
  }
};



// ---------------------------
// ADMIN - vypísať objednávky daného používateľa
// ---------------------------
const getOrdersByUserId = async (req, res) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) return res.status(400).json({ error: 'Neplatné ID používateľa' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Nie ste admin' });

  try {
    const [results] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(results || []);
  } catch (err) {
    console.error('Chyba DB pri načítaní objednávok:', err);
    res.status(500).json({ error: 'Chyba pri načítaní objednávok' });
  }
};

// ---------------------------
// ADMIN - zmazať používateľa podľa ID
// ---------------------------
const deleteUserById = async (req, res) => {
  const userIdToDelete = Number(req.params.id);
  const loggedInUserId = Number(req.user.id);

  if (isNaN(userIdToDelete)) return res.status(400).json({ error: 'Neplatné ID používateľa' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Nie ste admin' });

  try {
    const [results] = await pool.query('SELECT * FROM user WHERE id = ?', [userIdToDelete]);

    if (results.length === 0) return res.status(404).json({ error: 'Používateľ neexistuje' });

    const targetUser = results[0];

    // ochranné pravidlá
    if (userIdToDelete === loggedInUserId) return res.status(403).json({ error: 'You cannot delete yourself.' });
    if ([1, 32].includes(userIdToDelete)) return res.status(403).json({ error: 'This user is protected from deletion.' });
    if (targetUser.role === 'admin') return res.status(403).json({ error: 'You cannot delete another administrator.' });

    await pool.query('DELETE FROM user WHERE id = ?', [userIdToDelete]);

    res.json({ success: true, message: 'Používateľ bol vymazaný' });
  } catch (err) {
    console.error('Chyba DB pri mazaní používateľa:', err);
    res.status(500).json({ error: 'Chyba pri mazaní používateľa' });
  }
};

// ---------------------------
// ADMIN - zmena roly používateľa
// ---------------------------
const updateUserRole = async (req, res) => {
  const targetUserId = Number(req.params.id);
  const { role } = req.body;

  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Nemáte oprávnenie meniť roly' });
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Neplatná rola. Povolené sú len "user" alebo "admin"' });

  try {
    const [result] = await pool.query('UPDATE user SET role = ? WHERE id = ?', [role, targetUserId]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Používateľ neexistuje' });

    res.json({ message: `Rola používateľa bola zmenená na '${role}'` });
  } catch (err) {
    console.error('Chyba pri zmene roly:', err);
    res.status(500).json({ error: 'Chyba pri aktualizácii roly' });
  }
};



module.exports = { getUsers, createUser, loginUser, getUserProfile, updateUserProfile, deleteUserAccount, deleteUserById, getOrdersByUserId, getUserById, updateUserRole, verifyEmail };
