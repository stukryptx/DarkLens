const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'threatwire-super-secret-key-development-only';

const authMiddleware = (req, res, next) => {
  let token;
  const authHeader = req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    // Fallback for SSE EventSource which doesn't support custom headers
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
