const jwt = require('jsonwebtoken');

// Required middleware (token je povinný)
const required = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Neautorizovaný prístup' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Neplatný alebo vypršaný token' });

    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    req.userId = decoded.userId; // pre starší kód
    next();
  });
};

// Optional middleware (token môže chýbať)
const optional = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
      req.userId = decoded.userId; // pre starší kód
    }
    next();
  });
};

module.exports = { required, optional };
