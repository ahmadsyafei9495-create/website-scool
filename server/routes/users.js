const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('superadmin','admin'), (req, res) => {
  db.all('SELECT id, username, role, name FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', authenticate, authorize('superadmin'), async (req, res) => {
  const { username, password, role, name } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username,password,role,name) VALUES (?,?,?,?)', [username, hash, role, name||null], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

module.exports = router;
