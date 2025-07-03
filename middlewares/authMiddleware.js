const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Tenta obter o token do cookie
  let token = req.cookies?.token;

  // Se não tiver cookie, tenta no cabeçalho Authorization (usado na app)
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  }

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};



