const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const db = require('../database');


// Funkcia pre získanie všetkých používateľov
const getUsers = (req, res) => {
  const query = 'SELECT id, name, email, role FROM user';

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);  // loguj chybu na server
      res.status(500).json({ error: 'Interná chyba servera' });  // neposielaj DB chyby von
    } else {
      res.json(results);
    }
  });
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

const createUser = (req, res) => {
  const { name, email, password } = req.body;

  const defaultUrl = 'https://res.cloudinary.com/dd8gjvv80/image/upload/v1755594977/default-avatar_z3c30l.jpg';
  const defaultPublicId = 'default-avatar_z3c30l';

  const checkEmailQuery = 'SELECT * FROM user WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Chyba pri overovaní emailu.' });
    if (results.length > 0) return res.status(400).json({ error: 'Email je už zaregistrovaný.' });

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Chyba pri hashovaní hesla.' });

      const insertUserQuery = `
        INSERT INTO user (name, email, password, is_verified, user_photo, user_photo_public_id)
        VALUES (?, ?, ?, false, ?, ?)
      `;

      db.query(insertUserQuery, [name, email, hashedPassword, defaultUrl, defaultPublicId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Chyba pri ukladaní používateľa.' });

        const userId = result.insertId;
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

        db.query(
          'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [userId, token, expiresAtFormatted],
          (err) => {
            if (err) {
              console.error('Chyba pri ukladaní tokenu:', err);
              return res.status(500).json({ error: 'Chyba pri ukladaní tokenu.' });
            }

            const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

            transporter.sendMail({
              to: email,
              subject: 'Overenie emailu',
              html: `
                <p>Ahoj ${name},</p>
                <p>Prosím, over svoj účet kliknutím na odkaz nižšie:</p>
                <a href="${verificationLink}">${verificationLink}</a>
                <p>Ak si sa neregistroval, ignoruj tento email.</p>
              `,
            }, (err, info) => {
              if (err) {
                console.error('Chyba pri odosielaní emailu:', err);
                return res.status(500).json({ error: 'Nepodarilo sa odoslať overovací email.' });
              }
              res.status(201).json({ message: 'Registrácia úspešná. Skontroluj email pre overenie účtu.' });
            });
          }
        );
      });
    });
  });
};


// Funkcia pre overenie registracie pomocou emailu
const verifyEmail = (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: 'Token chýba' });
  }

  // Skontrolujeme, či token je v DB (teda ešte nebol použitý)
  const query = 'SELECT * FROM email_verification_tokens WHERE token = ?';
  db.query(query, [token], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Chyba databázy' });
    }

    if (results.length === 0) {
      // Token neexistuje => už bol použitý alebo je neplatný
      return res.status(400).json({ error: 'Token neplatný alebo už použitý' });
    }

    const tokenData = results[0];
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      // Token expiroval => tiež ho považujeme za neplatný/už použitý
      return res.status(400).json({ error: 'Token expiroval' });
    }

    // Token platný => označíme používateľa ako overeného
    const userId = tokenData.user_id;
    const updateQuery = 'UPDATE user SET is_verified = true WHERE id = ?';

    db.query(updateQuery, [userId], (err2) => {
      if (err2) {
        return res.status(500).json({ error: 'Chyba pri overení používateľa' });
      }

      // Vymažeme token z DB, aby už nebolo možné ho použiť znovu
      db.query('DELETE FROM email_verification_tokens WHERE user_id = ?', [userId], (err3) => {
        if (err3) {
          // Chyba pri mazaní tokenu, ale overenie považujeme za úspešné
          console.error('Chyba pri mazaní tokenu:', err3);
        }
        return res.status(200).json({ message: 'Email úspešne overený' });
      });
    });
  });
};


// Funkcia na prihlasenie uzivatela
const loginUser = (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM user WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Chyba pri pripojení k databáze' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No user exists with this email.' });
    }

    const user = results[0];

    // TU PRIDÁME KONTROLU IS_VERIFIED
    if (user.is_verified === 0) {
      return res.status(403).json({ error: 'Email nie je overený. Skontroluj svoj email.' });
    }

    // Porovnanie zadaného hesla s hashovaným heslom v databáze
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Chyba pri porovnávaní hesla' });
      }

      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect password.' });
      }

      // Ak je heslo správne, vytvoríme JWT token (v ňom už je aj role)
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '6h' }
      );

      // 🟢 TU SPRAVÍME MERGE KOŠÍKA
      const sessionId = req.headers['x-session-id'];
      if (sessionId) {
        db.query(
          "UPDATE cart_items SET user_id = ?, session_id = NULL WHERE session_id = ?",
          [user.id, sessionId],
          (err2) => {
            if (err2) console.error("Chyba pri merge košíka:", err2);
          }
        );
      }

      // Posielame token, email, name a role klientovi
      res.status(200).json({
        message: 'Prihlásenie úspešné',
        token,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    });
  });
};



// Funkcia pre získanie informácií o prihlásenom používateľovi (vrátane roly)
const getUserProfile = (req, res) => {
  const userId = req.user.userId; // oprava: req.user.userId (nie req.userId)

  const query = `
    SELECT name, email, profile_email, birth_date, mobile_number, address, city, postal_code, loyalty_points, user_photo, role 
    FROM user
    WHERE id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Chyba pri načítavaní údajov' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    res.status(200).json(results[0]);
  });
};


const updateUserProfile = (req, res) => {
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

  // **Úprava birth_date na formát YYYY-MM-DD**
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

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Chyba pri aktualizácii profilu' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Používateľ nebol nájdený' });
    }

    db.query(
      'SELECT id, name, email, profile_email, birth_date, mobile_number, address, city, postal_code FROM user WHERE id = ?',
      [userId],
      (err2, rows) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ error: 'Chyba pri načítaní profilu po aktualizácii' });
        }

        if (rows.length === 0) {
          return res.status(404).json({ error: 'Používateľ neexistuje' });
        }

        res.json(rows[0]);
      }
    );
  });
};


// Funkcia pre zmazanie účtu
const deleteUserAccount = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Neautorizovaný prístup' });
  }

  try {
    // 1. Vymaž položky košíka používateľa
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    // 2. Vymaž používateľa
    await db.query('DELETE FROM user WHERE id = ?', [userId]);

    res.json({ success: true, message: 'The account has been successfully deleted' });

  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Error deleting the account' });
  }
};


// ADMIN - GET USER BY ID
const getUserById = (req, res) => {
  const userId = Number(req.params.id);

  // Overenie ID
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Neplatné ID používateľa' });
  }

  // Overenie admin práv
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Nie ste admin' });
  }

  // Vyhľadanie používateľa
  db.query(
    'SELECT id, name, email, profile_email, birth_date, mobile_number, address, city, postal_code FROM user WHERE id = ?',
    [userId],
    (err, result) => {
      if (err) {
        console.error('Chyba DB pri načítaní používateľa:', err);
        return res.status(500).json({ error: 'Chyba pri načítaní používateľa' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Používateľ neexistuje' });
      }

      res.json(result[0]); // pošli detail používateľa
    }
  );
};


// ADMIN - Vypis objednavok daneho uzivatela 
const getOrdersByUserId = (req, res) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Neplatné ID používateľa' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Nie ste admin' });
  }

  db.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, results) => {
      if (err) {
        console.error('Chyba DB pri načítaní objednávok:', err);
        return res.status(500).json({ error: 'Chyba pri načítaní objednávok' });
      }
      // Ak chceš vrátiť aj položky, tu by si musel riešiť ďalší dotaz pre každú objednávku
      res.json(results || []);
    }
  );
};


// ADMIN - DELETE USER
const deleteUserById = (req, res) => {
  const userIdToDelete = Number(req.params.id);
  const loggedInUserId = Number(req.user.id); // pridaj Number() na istotu

  console.log('Žiadosť o vymazanie používateľa s ID:', userIdToDelete);
  console.log('ID žiadateľa:', loggedInUserId);
  console.log('Role žiadateľa:', req.user.role);

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Nie ste admin' });
  }

  if (isNaN(userIdToDelete)) {
    return res.status(400).json({ error: 'Neplatné ID používateľa' });
  }

  // 1. Získaj používateľa z databázy
  db.query('SELECT * FROM user WHERE id = ?', [userIdToDelete], (err, results) => {
    if (err) {
      console.error('Chyba pri načítaní používateľa:', err);
      return res.status(500).json({ error: 'Chyba databázy pri kontrole používateľa' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    const targetUser = results[0];
    console.log('userIdToDelete:', userIdToDelete, typeof userIdToDelete);
    console.log('loggedInUserId:', loggedInUserId, typeof loggedInUserId);

    // 2. Zabránime vymazaniu samého seba
    if (userIdToDelete === loggedInUserId) {
      return res.status(403).json({ error: 'You cannot delete yourself.' });
    }

    // 3. Zabránime vymazaniu hlavného admina (napr. ID 1)
    if (userIdToDelete === 1) {
      return res.status(403).json({ error: 'This user is protected from deletion.' });
    }

    // 3.5 Zabránime vymazaniu používateľa s ID 32
    if (userIdToDelete === 32) {
      return res.status(403).json({ error: 'This user is protected from deletion.' });
    }

    // 4. Voliteľne: zabránime vymazaniu iného admina
    if (targetUser.role === 'admin') {
      return res.status(403).json({ error: 'You cannot delete another administrator.' });
    }

    // 5. Ak prešiel všetky kontroly, vymaž ho
    db.query('DELETE FROM user WHERE id = ?', [userIdToDelete], (deleteErr, result) => {
      if (deleteErr) {
        console.error('Chyba DB pri mazaní používateľa:', deleteErr);
        return res.status(500).json({ error: 'Chyba pri mazaní používateľa' });
      }

      res.json({ success: true, message: 'Používateľ bol vymazaný' });
    });
  });
};


// ADMIN - Zmena roly používateľa (napr. na admina)
const updateUserRole = (req, res) => {
  const targetUserId = Number(req.params.id); // ID používateľa, ktorému chceme zmeniť rolu
  const { role } = req.body; // očakávame { role: 'admin' } alebo { role: 'user' }

  // Iba admin môže meniť role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Nemáte oprávnenie meniť roly' });
  }

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Neplatná rola. Povolené sú len "user" alebo "admin"' });
  }

  const query = 'UPDATE user SET role = ? WHERE id = ?';
  db.query(query, [role, targetUserId], (err, result) => {
    if (err) {
      console.error('Chyba pri zmene roly:', err);
      return res.status(500).json({ error: 'Chyba pri aktualizácii roly' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Používateľ neexistuje' });
    }

    res.json({ message: `Rola používateľa bola zmenená na '${role}'` });
  });
};


module.exports = { getUsers, createUser, loginUser, getUserProfile, updateUserProfile, deleteUserAccount, deleteUserById, getOrdersByUserId, getUserById, updateUserRole, verifyEmail };
