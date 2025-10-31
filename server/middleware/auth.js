const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme token\'ı bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token' });
  }
};

module.exports = authMiddleware;
