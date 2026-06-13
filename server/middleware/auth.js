const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change_this_secret';

function generateToken(user) {
  const payload = { id: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { generateToken, authenticate, authorize };
