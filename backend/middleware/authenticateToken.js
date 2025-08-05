const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);

  const token = authHeader?.split(' ')[1];
  console.log('Extracted token:', token);

  if (!token) return res.status(401).json({ error: 'Neautorizovaný prístup' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('JWT verify error:', err);
      return res.status(403).json({ error: 'Neplatný alebo vypršaný token' });
    }

    console.log('Decoded token:', decoded);

    // Nastavíme kompletný objekt user do req pre ďalšie middleware/handler
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    req.userId = decoded.userId; // 👈 pre starší kód

    next();
  });
};

// Verzia, ktorá nevyhadzuje chybu, ak token nie je prítomný
authenticateToken.optional = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  console.log('🛂 [Middleware] optional auth - token:', token);

  if (!token) {
    console.log('🛂 No token provided – guest user');
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('❌ JWT verify error:', err);
      return res.status(403).json({ error: 'Neplatný alebo vypršaný token' });
    }

    console.log('✅ Token decoded:', decoded);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    req.userId = decoded.userId;

    next();
  });
};

module.exports = authenticateToken;
