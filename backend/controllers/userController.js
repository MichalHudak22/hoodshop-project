const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const db = require('../database');


// Funkcia pre získanie všetkých používateľov
const getUsers = async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, name, email, role FROM user');
    res.json(results);
  } catch (err) {
    console.error('Chyba pri načítaní používateľov:', err);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};


// Funkcia pre vytvorenie nového používateľa registracia 
// Konfigurácia emailu
require('dotenv').config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // napr. tvojemail@gmail.com
    pass: process.env.EMAIL_PASS, // alebo App Password

  },
});

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const defaultAvatarUrl = 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1755594977/default-avatar_z3c30l.jpg';

  try {
    // 1️⃣ Overenie, či už email existuje
    const [existingUsers] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email je už zaregistrovaný.' });
    }

    // 2️⃣ Hashovanie hesla
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Vloženie používateľa s default avatarom
    const [insertResult] = await db.query(
      'INSERT INTO user (name, email, password, is_verified, user_photo, user_photo_public_id) VALUES (?, ?, ?, false, ?, NULL)',
      [name, email, hashedPassword, defaultAvatarUrl]
    );

    const userId = insertResult.insertId;

    // 4️⃣ Vytvorenie tokenu na overenie emailu
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAtFormatted]
    );

    // 5️⃣ Odoslanie overovacieho emailu (v samostatnom try/catch)
    const frontendURL = process.env.FRONTEND_URL;
    const verificationLink = `${frontendURL}/verify-email?token=${token}`;

    try {
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
      console.log(`Overovací email odoslaný na: ${email}`);
    } catch (emailErr) {
      console.error('Chyba pri odosielaní overovacieho emailu:', emailErr);
      // Nezastaví registráciu, iba loguje chybu
    }

    // 6️⃣ Úspešná odpoveď klientovi
    res.status(201).json({
      message: 'Registrácia úspešná. Skontroluj email pre overenie účtu.',
      userId,
    });

  } catch (err) {
    console.error('Chyba pri registrácii používateľa:', err);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};



// Funkcia pre overenie registracie pomocou emailu
const verifyEmail = async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: 'Token chýba' });
  }

  try {
    // 1️⃣ Skontrolujeme, či token existuje
    const [rows] = await db.query('SELECT * FROM email_verification_tokens WHERE token = ?', [token]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Token neplatný alebo už použitý' });
    }

    const tokenData = rows[0];
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return res.status(400).json({ error: 'Token expiroval' });
    }

    const userId = tokenData.user_id;

    // 2️⃣ Označíme používateľa ako overeného
    await db.query('UPDATE user SET is_verified = true WHERE id = ?', [userId]);

    // 3️⃣ Vymažeme token, aby sa už nedal použiť
    await db.query('DELETE FROM email_verification_tokens WHERE user_id = ?', [userId]);

    res.status(200).json({ message: 'Email úspešne overený' });

  } catch (err) {
    console.error('Chyba pri overovaní emailu:', err);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};



const { getAttempts, registerFailedAttempt, resetAttempts } = require('../middleware/failedLoginAttempts');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Skontrolujeme, či nie je účet zablokovaný
    const attemptData = getAttempts(email);
    if (attemptData.lockUntil && Date.now() < attemptData.lockUntil) {
      const minutesLeft = Math.ceil((attemptData.lockUntil - Date.now()) / 60000);
      return res.status(429).json({ error: `Účet je dočasne zablokovaný. Skúste znova o ${minutesLeft} min.` });
    }

    // 2️⃣ Načítame používateľa podľa emailu
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (users.length === 0) {
      registerFailedAttempt(email);
      return res.status(404).json({ error: 'Používateľ s týmto emailom neexistuje.' });
    }

    const user = users[0];

    // 3️⃣ Skontrolujeme, či je email overený
    if (user.is_verified === 0) {
      registerFailedAttempt(email);
      return res.status(403).json({ error: 'Email nie je overený. Skontroluj svoj email.' });
    }

    // 4️⃣ Porovnanie hesla
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      registerFailedAttempt(email);
      return res.status(400).json({ error: 'Nesprávne heslo.' });
    }

    // 5️⃣ Reset pokusov po úspešnom prihlásení
    resetAttempts(email);

    // 6️⃣ Vytvorenie JWT tokenu
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );

    // 7️⃣ Odpoveď klientovi
    res.status(200).json({
      message: 'Prihlásenie úspešné',
      token,
      email: user.email,
      name: user.name,
      role: user.role,
    });

  } catch (err) {
    console.error('Chyba pri prihlasovaní používateľa:', err);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};


// Funkcia pre získanie informácií o prihlásenom používateľovi (vrátane roly)
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // req.user.userId z JWT

    const [results] = await db.query(`
      SELECT name, email, profile_email, birth_date, mobile_number, address, city, postal_code, loyalty_points, user_photo, role 
      FROM user
      WHERE id = ?
    `, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error('Chyba pri načítavaní údajov používateľa:', err);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};



const updateUserProfile = async (req, res) => {
  try {
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

    // Úprava birth_date na formát YYYY-MM-DD
    if (filteredFields.birth_date) {
      const date = new Date(filteredFields.birth_date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Neplatný formát dátumu narodenia' });
      }
      filteredFields.birth_date = date.toISOString().split('T')[0]; // napr. '1990-11-09'
    }

    const setClause = [];
    const values = [];

    Object.entries(filteredFields).forEach(([key, value]) => {
      setClause.push(`${key} = ?`);
      values.push(value);
    });

    values.push(userId); // pre WHERE

    const sql = `UPDATE user SET ${setClause.join(', ')} WHERE id = ?`;
    const [updateResult] = await db.query(sql, values);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Používateľ nebol nájdený' });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, profile_email, birth_date, mobile_number, address, city, postal_code FROM user WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Chyba pri aktualizácii profilu:', err);
    res.status(500).json({ error: 'Interná chyba servera' });
  }
};



// Funkcia pre zmazanie účtu
const deleteUserAccount = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Neautorizovaný prístup' });
  }

  try {
    // 1️⃣ Vymaž všetky položky v košíku používateľa
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    // 2️⃣ Vymaž všetky tokeny na overenie emailu (ak existujú)
    await db.query('DELETE FROM email_verification_tokens WHERE user_id = ?', [userId]);

    // 3️⃣ Vymaž samotného používateľa
    const [result] = await db.query('DELETE FROM user WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    res.json({ success: true, message: 'Účet bol úspešne vymazaný' });
  } catch (err) {
    console.error('Chyba pri mazaní účtu:', err);
    res.status(500).json({ error: 'Chyba servera pri mazaní účtu' });
  }
};



// ADMIN - GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Overenie ID
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Neplatné ID používateľa' });
    }

    // Overenie admin práv
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nie ste admin' });
    }

    // Vyhľadanie používateľa
    const [rows] = await db.query(
      'SELECT id, name, email, profile_email, birth_date, mobile_number, address, city, postal_code FROM user WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Chyba DB pri načítaní používateľa:', err);
    res.status(500).json({ error: 'Chyba pri načítaní používateľa' });
  }
};


// ADMIN - Vypis objednavok daneho uzivatela 
const getOrdersByUserId = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Neplatné ID používateľa' });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nie ste admin' });
    }

    // Načítanie objednávok
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Načítanie položiek pre každú objednávku
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.product_id, oi.quantity, oi.price AS item_price, p.name AS product_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders || []);
  } catch (err) {
    console.error('Chyba DB pri načítaní objednávok:', err);
    res.status(500).json({ error: 'Chyba pri načítaní objednávok' });
  }
};



// ADMIN - DELETE USER
const deleteUserById = async (req, res) => {
  try {
    const userIdToDelete = Number(req.params.id);
    const loggedInUserId = Number(req.user.userId); // oprava: req.user.userId

    if (isNaN(userIdToDelete)) {
      return res.status(400).json({ error: 'Neplatné ID používateľa' });
    }

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nie ste admin' });
    }

    // Získanie používateľa
    const [users] = await db.query('SELECT * FROM user WHERE id = ?', [userIdToDelete]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    const targetUser = users[0];

    // Bezpečnostné kontroly
    if (userIdToDelete === loggedInUserId) {
      return res.status(403).json({ error: 'You cannot delete yourself.' });
    }
    if ([1, 32].includes(userIdToDelete)) {
      return res.status(403).json({ error: 'This user is protected from deletion.' });
    }
    if (targetUser.role === 'admin') {
      return res.status(403).json({ error: 'You cannot delete another administrator.' });
    }

    // Vymazanie používateľa
    await db.query('DELETE FROM user WHERE id = ?', [userIdToDelete]);

    res.json({ success: true, message: 'Používateľ bol vymazaný' });

  } catch (err) {
    console.error('DB error deleteUserById:', err);
    res.status(500).json({ error: 'Chyba pri mazaní používateľa' });
  }
};



// ADMIN - Zmena roly používateľa (napr. na admina)
const updateUserRole = async (req, res) => {
  try {
    const targetUserId = Number(req.params.id); // ID používateľa
    const { role } = req.body;

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nemáte oprávnenie meniť roly' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Neplatná rola. Povolené sú len "user" alebo "admin"' });
    }

    // 🚨 Check: ak je to "boh" admin, nedovoľ zmenu
    const SUPER_ADMIN_ID = 32;
    if (targetUserId === SUPER_ADMIN_ID) {
      return res.status(403).json({
        error: 'This admin is GOD and you cannot change their role. 😎'
      });
    }

    const [result] = await db.query(
      'UPDATE user SET role = ? WHERE id = ?',
      [role, targetUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    res.json({ message: `Rola používateľa bola zmenená na '${role}'` });

  } catch (err) {
    console.error('DB error updateUserRole:', err);
    res.status(500).json({ error: 'Chyba pri aktualizácii roly' });
  }
};



module.exports = { getUsers, createUser, loginUser, getUserProfile, updateUserProfile, deleteUserAccount, deleteUserById, getOrdersByUserId, getUserById, updateUserRole, verifyEmail };
