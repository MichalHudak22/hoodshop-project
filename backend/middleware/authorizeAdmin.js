const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Prístup zakázaný: len pre adminov' });
  }
  next();
};

module.exports = authorizeAdmin;
