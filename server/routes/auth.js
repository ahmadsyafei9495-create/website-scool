const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('../db');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    bcrypt.compare(password, user.password).then(match => {
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      const token = generateToken(user);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    }).catch(e => res.status(500).json({ error: e.message }));
  });
});

module.exports = router;
